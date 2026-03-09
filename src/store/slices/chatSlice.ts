import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Message } from '../../interfaces/message';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  isStreaming: boolean;
}

const STORAGE_KEY = 'chat_state_v1';

const loadSaved = (): Pick<ChatState, 'conversations' | 'activeId'> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const WELCOME_MESSAGE = `¡Hola! Soy tu asistente de cotizaciones. Estoy aquí para ayudarte a:

• Crear y gestionar cotizaciones para tus clientes
• Consultar precios y disponibilidad de materiales
• Hacer seguimiento de pedidos y proveedores
• Enviar cotizaciones por email

¿En qué te puedo ayudar hoy?`;

const makeInitialConversation = (): Conversation => ({
  id: `chat-${Date.now()}-init`,
  title: 'Nueva conversación',
  messages: [{ role: 'assistant', content: WELCOME_MESSAGE }],
  createdAt: Date.now(),
});

const buildInitialState = (): ChatState => {
  const saved = loadSaved();
  if (saved && saved.conversations.length > 0) {
    return { conversations: saved.conversations, activeId: saved.activeId, isStreaming: false };
  }
  const conv = makeInitialConversation();
  return { conversations: [conv], activeId: conv.id, isStreaming: false };
};

const initialState: ChatState = buildInitialState();

const makeId = () =>
  `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    createConversation: (state) => {
      const id = makeId();
      state.conversations.unshift({
        id,
        title: 'Nueva conversación',
        messages: [{ role: 'assistant', content: WELCOME_MESSAGE }],
        createdAt: Date.now(),
      });
      state.activeId = id;
    },

    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeId = action.payload;
    },

    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(
        (c) => c.id !== action.payload,
      );
      if (state.activeId === action.payload) {
        state.activeId = state.conversations[0]?.id ?? null;
      }
    },

    addUserMessage: (state, action: PayloadAction<string>) => {
      const conv = state.conversations.find((c) => c.id === state.activeId);
      if (!conv) return;
      conv.messages.push({ role: 'user', content: action.payload, createdAt: Date.now() });
      // Auto-title from first user message
      if (conv.messages.filter((m) => m.role === 'user').length === 1) {
        const text = action.payload;
        conv.title = text.length > 45 ? text.slice(0, 45) + '…' : text;
      }
    },

    startAssistantMessage: (state) => {
      const conv = state.conversations.find((c) => c.id === state.activeId);
      if (!conv) return;
      conv.messages.push({ role: 'assistant', content: '', createdAt: Date.now() });
      state.isStreaming = true;
    },

    appendChunk: (state, action: PayloadAction<string>) => {
      const conv = state.conversations.find((c) => c.id === state.activeId);
      if (!conv) return;
      const last = conv.messages[conv.messages.length - 1];
      if (last?.role === 'assistant') {
        last.content += action.payload;
      }
    },

    stopStreaming: (state) => {
      state.isStreaming = false;
    },
  },
});

export const {
  createConversation,
  setActiveConversation,
  deleteConversation,
  addUserMessage,
  startAssistantMessage,
  appendChunk,
  stopStreaming,
} = chatSlice.actions;
