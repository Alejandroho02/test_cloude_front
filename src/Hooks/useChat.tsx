import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {
  addUserMessage,
  appendChunk,
  createConversation,
  deleteConversation,
  setActiveConversation,
  startAssistantMessage,
  stopStreaming,
} from '../store/slices/chatSlice';
import { addQuote } from '../store/slices/quotesSlice';
import { toast } from 'react-toastify';

type Role = 'user' | 'assistant' | 'system';
type ChatMessage = {
    createdAt: any; role: Role; content: string 
};

export type CardStatus = 'idle' | 'executed' | 'discarded';

const CARD_REGEX = /<<<ACTION_CARD_START>>>([\s\S]*?)<<<ACTION_CARD_END>>>/g;
const API_URL = `${import.meta.env.VITE_BASE_URL}/chat`;

const parseCards = (text: string) =>
  Array.from(text.matchAll(CARD_REGEX))
    .map((m) => {
      try { return JSON.parse(m[1].trim()); }
      catch { return null; }
    })
    .filter(Boolean) as any[];

const normalizeFields = (fields: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k.trim().toLowerCase(), v])
  );

const stripCards = (content: string) =>
  content.replace(CARD_REGEX, '').trim();

export const useChat = () => {
  const dispatch = useDispatch();

  const conversations  = useSelector((s: RootState) => s.chat.conversations);
  const activeId       = useSelector((s: RootState) => s.chat.activeId);
  const isStreaming    = useSelector((s: RootState) => s.chat.isStreaming);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = (activeConversation?.messages ?? []) as ChatMessage[];

  const [input, setInput] = useState('');
  const [cardStatuses, setCardStatuses] = useState<Record<string, CardStatus>>({});
  const textareaRef    = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef      = useRef<HTMLDivElement | null>(null);
  const sendMessageRef = useRef<(text: string) => Promise<void>>(() => Promise.resolve());

  // Reset card statuses when switching conversations
  useEffect(() => {
    setCardStatuses({});
  }, [activeId]);

  // Mantiene la referencia actualizada en cada render
  // para que el useCallback pueda llamar a handleSendMessage sin quedar obsoleto
  // (se asigna justo después de definir handleSendMessage, más abajo)

  const handleCardAction = useCallback(
    (action: string, payload: Record<string, string>, cardId?: string) => {
      const id = cardId ?? JSON.stringify(payload);

      switch (action) {
        case 'create_quote': {
          // normalize incoming keys (lowercase + trim) for consistency
          const normalized = normalizeFields(payload);
          const cliente = normalized.cliente || normalized.client || '';
          const title = cliente ? `Cotización — ${cliente}` : 'Nueva Cotización';
          dispatch(addQuote({ title, fields: normalized }));
          // mark the card executed using the stable key (id holds JSON stringify)
          setCardStatuses((prev) => ({ ...prev, [id]: 'executed' }));
          toast.success(`Cotización creada para ${cliente || 'el cliente'}`);
          break;
        }
        case 'send_email':
          setCardStatuses((prev) => ({ ...prev, [id]: 'executed' }));
          toast.info(`Email enviado a ${payload.destinatario || 'el destinatario'}`);
          break;
        case 'acknowledge_flag': {
          setCardStatuses((prev) => ({ ...prev, [id]: 'executed' }));
          toast.info('Alerta marcada como revisada');
          const flagLines = Object.entries(payload)
            .filter(([, v]) => v)
            .map(([k, v]) => `- ${k}: ${v}`)
            .join('\n');
          const flagMsg = flagLines
            ? `He revisado la alerta y confirmé los siguientes datos:\n${flagLines}`
            : 'He revisado y confirmado la alerta.';
          sendMessageRef.current(flagMsg);
          break;
        }
        case 'escalate':
          setCardStatuses((prev) => ({ ...prev, [id]: 'executed' }));
          toast.info('Escalado al equipo correspondiente');
          break;
        case 'contact_supplier': {
          const nombre = payload.nombre || payload.proveedor || '';
          setCardStatuses((prev) => ({ ...prev, [id]: 'executed' }));
          toast.info(`Proveedor seleccionado: ${nombre}`);
          const msg = nombre
            ? `He seleccionado al proveedor "${nombre}". Por favor actualiza la cotización incluyendo a este proveedor.`
            : 'He seleccionado un proveedor. Por favor actualiza la cotización.';
          sendMessageRef.current(msg);
          break;
        }
        case 'discard':
          setCardStatuses((prev) => ({ ...prev, [id]: 'discarded' }));
          toast.info('Acción descartada');
          break;
        default:
          console.warn('Acción desconocida:', action);
      }
    },
    [dispatch],
  );

  const handleSendMessage = async (text: string) => {
    const cleanHistory = messages
      .map((m) => ({ role: m.role, content: stripCards(m.content) }))
      .filter((m) => m.content !== '');

    dispatch(addUserMessage(text));
    dispatch(startAssistantMessage());
    setCardStatuses({});

    const fullHistory = [...cleanHistory, { role: 'user', content: text }];
    const historyB64 = btoa(unescape(encodeURIComponent(JSON.stringify(fullHistory))));
    const url = `${API_URL}?message=${encodeURIComponent(text)}&history=${historyB64}`;

    const evtSource = new EventSource(url);

    evtSource.onmessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'info') return;
        if (data.done || data.type === 'error') {
          evtSource.close();
          dispatch(stopStreaming());
          return;
        }
        if (data.text) dispatch(appendChunk(data.text));
      } catch (err) {
        console.error('Parse error:', err);
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
      dispatch(stopStreaming());
      toast.error('Error de conexión con el servidor');
    };
  };

  // Actualiza el ref en cada render para que handleCardAction no quede con closure obsoleta
  sendMessageRef.current = handleSendMessage;

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    if (!activeId) dispatch(createConversation());
    const text = input.trim();
    setInput('');
    handleSendMessage(text);
  };

  const handleNewChat = () => dispatch(createConversation());
  const handleSelectConversation = (id: string) => dispatch(setActiveConversation(id));
  const handleDeleteConversation = (id: string) => dispatch(deleteConversation(id));

  const lastMessage = messages[messages.length - 1];
  const sideCards =
    lastMessage?.role === 'assistant' ? parseCards(lastMessage.content) : [];

  return {
    messages, isStreaming, input, setInput,
    textareaRef, scrollRef,
    handleSend, handleSendMessage, handleCardAction,
    sideCards, cardStatuses,
    cardRegex: CARD_REGEX,
    conversations, activeId,
    handleNewChat, handleSelectConversation, handleDeleteConversation,
  };
};
