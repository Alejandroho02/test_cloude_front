import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Quote {
  id: string;
  title: string;
  fields: Record<string, string>;
  createdAt: string;
}

interface QuotesState {
  quotes: Quote[];
}

const QUOTES_KEY = 'quotes_state_v1';

// normalize field keys to lowercase when reading historic data, stripping
// whitespace to avoid missing values later on (especially 'cliente' names).
const normalizeFields = (fields: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k.trim().toLowerCase(), v])
  );

const loadQuotes = (): Quote[] => {
  try {
    const raw = localStorage.getItem(QUOTES_KEY);
    const arr: Quote[] = raw ? JSON.parse(raw) : [];
    return arr.map((q) => ({ ...q, fields: normalizeFields(q.fields) }));
  } catch {
    return [];
  }
};

const initialState: QuotesState = {
  quotes: loadQuotes(),
};

export const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    addQuote: (state, action: PayloadAction<Omit<Quote, 'id' | 'createdAt'>>) => {
      // ensure we always store normalized keys
      const normalized = normalizeFields(action.payload.fields);
      state.quotes.unshift({
        ...action.payload,
        fields: normalized,
        id: `COT-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    },
    deleteQuote: (state, action: PayloadAction<string>) => {
      state.quotes = state.quotes.filter((q) => q.id !== action.payload);
    },
  },
});

export const { addQuote, deleteQuote } = quotesSlice.actions;
