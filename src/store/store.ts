import { configureStore } from '@reduxjs/toolkit';
import { chatApi } from '../Api/RequestApi';
import { chatSlice } from './slices/chatSlice';
import { quotesSlice } from './slices/quotesSlice';

const STORAGE_KEY = 'chat_state_v1';

export const store = configureStore({
  reducer: {
    [chatApi.reducerPath]: chatApi.reducer,
    chat: chatSlice.reducer,
    quotes: quotesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatApi.middleware),
});

// Persist state to localStorage on every state change
store.subscribe(() => {
  const { chat, quotes } = store.getState();
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ conversations: chat.conversations, activeId: chat.activeId }),
    );
    localStorage.setItem('quotes_state_v1', JSON.stringify(quotes.quotes));
  } catch {
    // storage quota exceeded or unavailable — silently ignore
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
