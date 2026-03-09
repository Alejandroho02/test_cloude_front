import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import {
  createConversation,
  deleteConversation,
  setActiveConversation,
} from '../../store/slices/chatSlice';
import { deleteQuote, type Quote } from '../../store/slices/quotesSlice';
import { QuoteModal } from '../QuoteModal/QuoteModal';
import './sidebar.scss';

type Tab = 'chats' | 'quotes';

export const Sidebar = () => {
  const dispatch      = useDispatch();
  const conversations = useSelector((s: RootState) => s.chat.conversations);
  const activeId      = useSelector((s: RootState) => s.chat.activeId);
  const quotes        = useSelector((s: RootState) => s.quotes.quotes);

  const [tab, setTab]               = useState<Tab>('chats');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const handleNew    = () => dispatch(createConversation());
  const handleSelect = (id: string) => dispatch(setActiveConversation(id));
  const handleDeleteConv = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(deleteConversation(id));
  };
  const handleDeleteQuote = (id: string) => dispatch(deleteQuote(id));

  return (
    <>
      <aside className="sidebar">
        {/* Tabs */}
        <div className="sidebar__tabs">
          <button
            className={`sidebar__tab${tab === 'chats' ? ' sidebar__tab--active' : ''}`}
            onClick={() => setTab('chats')}
          >
            Chats
            <span className="sidebar__tab-count">{conversations.length}</span>
          </button>
          <button
            className={`sidebar__tab${tab === 'quotes' ? ' sidebar__tab--active' : ''}`}
            onClick={() => setTab('quotes')}
          >
            Cotizaciones
            <span className="sidebar__tab-count">{quotes.length}</span>
          </button>
        </div>

        {/* ── CHATS ── */}
        {tab === 'chats' && (
          <>
            <div className="sidebar__new-btn-wrap">
              <button className="sidebar__new-btn" onClick={handleNew}>
                + Nuevo chat
              </button>
            </div>
            <div className="sidebar__list">
              {conversations.length === 0 && (
                <p className="sidebar__empty">Sin conversaciones aún</p>
              )}
              {conversations.map((conv) => {
                const isActive = conv.id === activeId;
                const fecha = new Date(conv.createdAt).toLocaleDateString('es-MX', {
                  day: '2-digit', month: 'short',
                });
                return (
                  <div
                    key={conv.id}
                    className={`sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
                    onClick={() => handleSelect(conv.id)}
                  >
                    <div className="sidebar__item-header">
                      <span className="sidebar__item-date">{fecha}</span>
                      <button
                        className="sidebar__item-delete"
                        onClick={(e) => handleDeleteConv(e, conv.id)}
                        title="Eliminar"
                      >✕</button>
                    </div>
                    <p className="sidebar__item-title">{conv.title}</p>
                    {conv.messages.length > 0 && (
                      <span className="sidebar__item-count">{conv.messages.length} mensajes</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── COTIZACIONES ── */}
        {tab === 'quotes' && (
          <div className="sidebar__list">
            {quotes.length === 0 && (
              <p className="sidebar__empty">Sin cotizaciones aún</p>
            )}
            {quotes.map((quote) => {
              const fecha = new Date(quote.createdAt).toLocaleDateString('es-MX', {
                day: '2-digit', month: 'short',
              });
              // client name finder: check each key case‑insensitively for
              // "client"/"cliente" so even unnormalized data shows up.
              const cliente = (() => {
                const candidate = Object.keys(quote.fields).find((k) =>
                  /cliente?|client?/i.test(k)
                );
                return candidate
                  ? quote.fields[candidate] || '—'
                  : '—';
              })();
              const pieza = quote.fields.pieza || quote.fields.material || '';
              return (
                <div
                  key={quote.id}
                  className="sidebar__item sidebar__item--quote"
                  onClick={() => setSelectedQuote(quote)}
                >
                  <div className="sidebar__item-header">
                    <span className="sidebar__item-id">{quote.id}</span>
                    <span className="sidebar__item-date">{fecha}</span>
                  </div>
                  <p className="sidebar__item-client">{cliente}</p>
                  {pieza && <p className="sidebar__item-part">{pieza}</p>}
                </div>
              );
            })}
          </div>
        )}
      </aside>

      {selectedQuote && (
        <QuoteModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onDelete={handleDeleteQuote}
        />
      )}
    </>
  );
};
