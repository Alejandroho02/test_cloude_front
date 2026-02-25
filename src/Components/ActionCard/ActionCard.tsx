import { useState } from "react";
import { type HtmlHTMLAttributes } from "react";
import { Input } from "../input/input";
import "./actioncard.scss";
import type { CardStatus } from "../../Hooks/useChat";

interface ActionCardProps extends HtmlHTMLAttributes<HTMLDivElement> {
  title: string;
  text?: string[];
  form?: {
    label: string;
    name: string;
    value: string;
    type?: string;
  }[];
  actions?: {
    label: string;
    action: string;
  }[];
  cardId?: string;
  status?: CardStatus;
  onAction?: (action: string, payload: Record<string, string>, cardId?: string) => void;
}

export const ActionCard = ({
  title,
  text = [],
  form = [],
  actions = [],
  onAction,
  cardId,
  status,
  ...props
}: ActionCardProps) => {

  const [formState, setFormState] = useState<Record<string, string>>(
    Object.fromEntries(form.map((item) => [item.name, item.value ?? ""]))
  );

  const handleChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  if (status === 'executed') {
    return (
      <section className="action-card action-card--executed" {...props}>
        <h2 className="action-card__title">{title}</h2>
        <p className="action-card__status-text">✅ Ejecutado</p>
      </section>
    );
  }

  if (status === 'discarded') {
    return (
      <section className="action-card action-card--discarded" {...props}>
        <h2 className="action-card__title">{title}</h2>
        <p className="action-card__status-text">🗑️ Descartado</p>
      </section>
    );
  }

  return (
    <section className="action-card" {...props}>
      <h2 className="action-card__title">{title}</h2>

      {text.map((itemText, index) => (
        <p key={index} className="action-card__text">{itemText}</p>
      ))}

      <div className="action-card__form">
        {form.map((item) => (
          <Input
            key={item.name}
            label={item.label}
            value={formState[item.name] || ""}
            type={item.type || "text"}
            onChange={(e) => handleChange(item.name, e.target.value)}
          />
        ))}
      </div>

      {actions.length > 0 && (
        <div className="action-card__footer">
          {actions.map((btn, index) => (
            <button
              key={index}
              onClick={() => onAction?.(btn.action, formState, cardId)}  
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};