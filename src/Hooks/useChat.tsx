import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { addUserMessage, appendChunk, startAssistantMessage, stopStreaming } from '../store/slices/chatSlice';


const cardRegex = /<<<ACTION_CARD_START>>>([\s\S]*?)<<<ACTION_CARD_END>>>/g;

const parseCards = (text: string) =>
  Array.from(text.matchAll(cardRegex))
    .map((m) => {
      try {
        return JSON.parse(m[1].trim());
      } catch (err) {
        console.error('Error parsing ACTION_CARD:', err);
        return null;
      }
    })
    .filter(Boolean);

export const useChat = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.chat.messages);
  const isStreaming = useSelector((state: RootState) => state.chat.isStreaming);

  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

const handleSendMessage = async (text: string) => {
  // 1. Construir historial limpio ANTES de despachar
  const cleanHistory = messages
    .map((msg) => ({
      ...msg,
      content: msg.content
        .replace(/<<<ACTION_CARD_START>>>[\s\S]*?<<<ACTION_CARD_END>>>/g, '')
        .trim(),
    }))
    .filter((msg) => msg.content !== '');

  const fullHistory = [...cleanHistory, { role: 'user', content: text }];

  // 2. Despachar después de construir el historial
  dispatch(addUserMessage(text));
  dispatch(startAssistantMessage());

  const historyB64 = btoa(unescape(encodeURIComponent(JSON.stringify(fullHistory))));
  const url = `http://192.168.100.8:8000/api/chat?message=${encodeURIComponent(text)}&history=${historyB64}`;

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
    } catch {
      // ignore parse errors
    }
  };

  evtSource.onerror = () => {
    evtSource.close();
    dispatch(stopStreaming());
  };
};

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    handleSendMessage(input.trim());
    setInput('');
  };

  const handleCardAction = (action: string, payload: Record<string, string>) => {
    console.log('Action:', action);
    console.log('Payload:', payload);
  };

  const lastMessage = messages[messages.length - 1];
  const sideCards = lastMessage?.role === 'assistant'
    ? parseCards(lastMessage.content)
    : [];

  return {
    messages,
    isStreaming,
    input,
    setInput,
    textareaRef,
    scrollRef,
    handleSend,
    handleSendMessage,
    handleCardAction,
    sideCards,
    cardRegex,
  };
};