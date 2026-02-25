import { useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { addUserMessage, appendChunk, startAssistantMessage, stopStreaming } from '../store/slices/chatSlice';
import { toast } from 'react-toastify';

type Role = 'user' | 'assistant' | 'system';
type ChatMessage = { role: Role; content: string };

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

const stripCards = (content: string) =>
  content.replace(/<<<ACTION_CARD_START>>>[\s\S]*?<<<ACTION_CARD_END>>>/g, '').trim();

export const useChat = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.chat.messages) as ChatMessage[];
  const isStreaming = useSelector((state: RootState) => state.chat.isStreaming);

  const [input, setInput] = useState('');
  const [cardStatuses, setCardStatuses] = useState<Record<string, CardStatus>>({});
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);



  const handleCardAction = useCallback((action: string, payload: Record<string, string>, cardId?: string) => {
    const id = cardId ?? JSON.stringify(payload);

    switch (action) {
      case 'create_quote':
        setCardStatuses((prev) => ({ ...prev, [id]: 'executed' }));
        toast.success(`✅ Cotización creada para ${payload.cliente || 'el cliente'}`);
        break;
      case 'send_email':
        console.log('📤 Enviando email:', payload);
        setCardStatuses((prev) => ({ ...prev, [id]: 'executed' }));
        toast.info(`📤 Email enviado a ${payload.destinatario || 'el destinatario'}`);
        break;
      case 'acknowledge_flag':
        setCardStatuses((prev) => ({ ...prev, [id]: 'executed' }));
        toast.info('🚩 Alerta marcada como revisada');
        break;
      case 'escalate':
        setCardStatuses((prev) => ({ ...prev, [id]: 'executed' }));
        toast.info('⚠️ Escalado al equipo correspondiente');
        break;
      case 'contact_supplier':
        setCardStatuses((prev) => ({ ...prev, [id]: 'executed' }));
        toast.info(`🤝 Contactando proveedor: ${payload.nombre || ''}`);
        break;
      case 'discard':
        setCardStatuses((prev) => ({ ...prev, [id]: 'discarded' }));
        toast.info('🗑️ Acción descartada');
        break;
      default:
        console.warn('Acción desconocida:', action);
    }
  }, []);

const handleSendMessage = async (text: string) => {
  const cleanHistory = messages
    .map((m) => ({ ...m, content: stripCards(m.content) }))
    .filter((m) => m.content !== '');

  const fullHistory = [...cleanHistory, { role: 'user', content: text }];

  dispatch(addUserMessage(text));
  dispatch(startAssistantMessage());
  setCardStatuses({});

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

      if (data.text) {
        dispatch(appendChunk(data.text));
      }
    } catch (err) {
      console.error('Parse error:', err);
    }
  };

  evtSource.onerror = () => {
    evtSource.close();
    dispatch(stopStreaming());
    toast.error(' Error de conexión con el servidor');
  };
};

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    handleSendMessage(input.trim());
    setInput('');
  };

  const lastMessage = messages[messages.length - 1];
  const sideCards = lastMessage?.role === 'assistant' ? parseCards(lastMessage.content) : [];

  return {
    messages, isStreaming, input, setInput,
    textareaRef, scrollRef,
    handleSend, handleSendMessage, handleCardAction,
    sideCards, cardStatuses,
    cardRegex: CARD_REGEX,

  };
};