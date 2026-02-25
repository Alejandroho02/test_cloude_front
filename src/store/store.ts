import { configureStore } from '@reduxjs/toolkit';
import { chatApi } from '../Api/RequestApi';
import { chatSlice } from './slices/chatSlice';


export const store = configureStore({
  reducer: {
    [chatApi.reducerPath]: chatApi.reducer,
    chat: chatSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;