import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Message } from '../../interfaces/message';


interface ChatState {
  messages: Message[];
  isStreaming: boolean;
}

const initialState: ChatState = {
  messages: [],
  isStreaming: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({ role: 'user', content: action.payload });
    },
    startAssistantMessage: (state) => {
      state.messages.push({ role: 'assistant', content: '' });
      state.isStreaming = true;
    },
    appendChunk: (state, action: PayloadAction<string>) => {
      const last = state.messages[state.messages.length - 1];
      if (last?.role === 'assistant') {
        last.content += action.payload;
      }
    },
    stopStreaming: (state) => {
      state.isStreaming = false;
    },
  },
});

export const { addUserMessage, startAssistantMessage, appendChunk, stopStreaming } = chatSlice.actions;