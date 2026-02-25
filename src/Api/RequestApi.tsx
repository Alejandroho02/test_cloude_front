import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Message } from '../interfaces/message';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.BASE_URL }),
  endpoints: (builder) => ({
    sendMessage: builder.mutation<void, { message: string; history: Message[] }>({
      queryFn: () => ({ data: undefined }),
    }),
  }),
});