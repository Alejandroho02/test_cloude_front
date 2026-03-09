import { useState } from 'react';
import type { Quote } from '../../store/slices/quotesSlice';
import './quotemodal.scss';

interface QuoteModalProps {
  quote: Quote;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const FIELD_LABELS: Record<string, string> = {
  cliente:      'Cliente',
  client:       'Cliente',
  pieza:        'Pieza',
  material:     'Material',
  cantidad:     'Cantidad',
  precio:       'Precio',
  orden:        'Orden',
  proveedor:    'Proveedor',
  destinatario: 'Destinatario',
  asunto:       'Asunto',
  descripcion:  'Descripción',
  notas:        'Notas',
};

export const QuoteModal = ({ quote, onClose, onDelete }: QuoteModalProps) => {
  const [copied, setCopied] = useState(false);

  const fecha = new Date(quote.createdAt).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const handleCopy = () => {
    const lines = [
      `${quote.id} — ${quote.title}`,
      `Fecha: ${fecha}`,
      '',
      ...Object.entries(quote.fields)
        .filter(([, v]) => v)
        .map(([k, v]) => `${FIELD_LABELS[k] ?? k}: ${v}`),
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="qmodal-backdrop" onClick={handleBackdrop}>
      <div className="qmodal">
        <div className="qmodal__header">
          <div>
            <span className="qmodal__id">{quote.id}</span>
            <h2 className="qmodal__title">{quote.title}</h2>
            <span className="qmodal__date">{fecha}</span>
          </div>
          <button className="qmodal__close" onClick={onClose}>✕</button>
        </div>

        <div className="qmodal__fields">
          {Object.entries(quote.fields).map(([key, value]) => (
            value ? (
              <div key={key} className="qmodal__field">
                <span className="qmodal__field-label">{FIELD_LABELS[key] ?? key}</span>
                <span className="qmodal__field-value">{value}</span>
              </div>
            ) : null
          ))}
        </div>

        <div className="qmodal__footer">
          <button
            className="qmodal__delete-btn"
            onClick={() => { onDelete(quote.id); onClose(); }}
          >
            Eliminar
          </button>
          <button
            className={`qmodal__copy-btn${copied ? ' qmodal__copy-btn--copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ Copiado' : 'Copiar detalles'}
          </button>
        </div>
      </div>
    </div>
  );
};
