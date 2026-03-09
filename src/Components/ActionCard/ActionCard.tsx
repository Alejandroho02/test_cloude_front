import { useState } from "react";
import { type HtmlHTMLAttributes } from "react";
import "./actioncard.scss";
import type { CardStatus } from "../../Hooks/useChat";

interface FormField {
  label: string;
  name: string;
  value: string;
  type?: string;
}

interface Action {
  label: string;
  action: string;
}

interface ActionCardProps extends HtmlHTMLAttributes<HTMLDivElement> {
  title: string;
  type?: string;
  subtitle?: string;
  text?: string[];
  form?: FormField[];
  actions?: Action[];
  cardId?: string;
  status?: CardStatus;
  onAction?: (action: string, payload: Record<string, string>, cardId?: string) => void;
}

type TypeConfig = {
  icon: string;
  color: string;
  bgLight: string;
  borderColor: string;
};

const TYPE_CONFIG: Record<string, TypeConfig> = {
  email:    { icon: "✉",  color: "#2563eb", bgLight: "#eff6ff", borderColor: "#2563eb" },
  quote:    { icon: "◻",  color: "#2563eb", bgLight: "#eff6ff", borderColor: "#2563eb" },
  flag:     { icon: "⚠",  color: "#f59e0b", bgLight: "#fffbeb", borderColor: "#f59e0b" },
  supplier: { icon: "☎",  color: "#7c3aed", bgLight: "#f5f3ff", borderColor: "#7c3aed" },
  default:  { icon: "≡",  color: "#64748b", bgLight: "#f8fafc", borderColor: "#94a3b8" },
};

const ACTION_ICONS: Record<string, string> = {
  send_email:       "✈ ",
  create_quote:     "✓ ",
  acknowledge_flag: "✓ ",
  escalate:         "↑ ",
  contact_supplier: "☎ ",
};

const FIELD_ICONS: Record<string, string> = {
  destinatario: "👤",
  asunto:       "◻",
  cliente:      "👤",
  pieza:        "⚙",
  material:     "⚙",
  cantidad:     "#",
  orden:        "#",
};

const BODY_FIELD_NAMES = ["mensaje", "mensaje_sugerido", "body", "descripcion"];

function inferType(type?: string, actions?: Action[]): string {
  if (type && TYPE_CONFIG[type]) return type;
  const names = actions?.map((a) => a.action) ?? [];
  if (names.includes("send_email"))                                  return "email";
  if (names.includes("create_quote"))                                return "quote";
  if (names.includes("acknowledge_flag") || names.includes("escalate")) return "flag";
  if (names.includes("contact_supplier"))                            return "supplier";
  return "default";
}

function getButtonVariant(action: string, index: number): "primary" | "secondary" | "danger" {
  if (action === "discard") return "danger";
  if (index === 0)          return "primary";
  return "secondary";
}

export const ActionCard = ({
  title,
  type,
  subtitle,
  text = [],
  form = [],
  actions = [],
  onAction,
  cardId,
  status,
  ...props
}: ActionCardProps) => {
  const [formState, setFormState] = useState<Record<string, string>>(
    // always store strings in state -- backend might include numbers/etc.
    Object.fromEntries(form.map((f) => [f.name, String(f.value ?? "")] ))
  );
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const handleChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
    setMissingFields((prev) => prev.filter((f) => f !== name));
  };

  const handleAction = (action: string) => {
    if (action === "discard") {
      onAction?.(action, formState, cardId);
      return;
    }
    const empty = form
      .filter((f) => !BODY_FIELD_NAMES.includes(f.name))
      .filter((f) => {
        const v = formState[f.name];
        if (typeof v === "string") return !v.trim();
        // anything else (undefined/null/number) count as empty
        return v == null || v === "";
      })
      .map((f) => f.name);

    if (empty.length > 0) {
      setMissingFields(empty);
      return;
    }
    setMissingFields([]);
    onAction?.(action, formState, cardId);
  };

  const cardType = inferType(type, actions);
  const config   = TYPE_CONFIG[cardType];

  const bodyField  = form.find((f) => BODY_FIELD_NAMES.includes(f.name));
  const infoFields = form.filter((f) => !BODY_FIELD_NAMES.includes(f.name));

  if (status === "executed") {
    return (
      <section
        className="action-card action-card--executed"
        style={{ borderLeftColor: config.color }}
        {...props}
      >
        <div className="action-card__header">
          <div className="action-card__icon-wrap" style={{ background: config.bgLight, color: config.color }}>
            {config.icon}
          </div>
          <div className="action-card__header-text">
            <h2 className="action-card__title" style={{ color: config.color }}>{title}</h2>
            <span className="action-card__status-text">✓ Ejecutado</span>
          </div>
        </div>
      </section>
    );
  }

  if (status === "discarded") {
    return (
      <section className="action-card action-card--discarded" {...props}>
        <div className="action-card__header">
          <div className="action-card__icon-wrap">
            {config.icon}
          </div>
          <div className="action-card__header-text">
            <h2 className="action-card__title">{title}</h2>
            <span className="action-card__status-text">✕ Descartado</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`action-card action-card--${cardType}`}
      style={{ borderLeftColor: config.borderColor }}
      {...props}
    >
      {/* Header */}
      <div className="action-card__header">
        <div
          className="action-card__icon-wrap"
          style={{ background: config.bgLight, color: config.color }}
        >
          {config.icon}
        </div>
        <div className="action-card__header-text">
          <h2 className="action-card__title" style={{ color: config.color }}>{title}</h2>
          {subtitle && <span className="action-card__subtitle">{subtitle}</span>}
        </div>
      </div>

      {/* Text paragraphs */}
      {text.map((t, i) => (
        <p key={i} className="action-card__text">{t}</p>
      ))}

      {/* Info field rows */}
      {infoFields.length > 0 && (
        <div className="action-card__fields">
          {infoFields.map((field) => {
            const isMissing = missingFields.includes(field.name);
            return (
              <div key={field.name} className={`action-card__field-row${isMissing ? " action-card__field-row--error" : ""}`}>
                <span className="action-card__field-icon">
                  {FIELD_ICONS[field.name] ?? "·"}
                </span>
                <span className="action-card__field-label">{field.label}:</span>
                <input
                  className="action-card__field-input"
                  value={formState[field.name] ?? ""}
                  type={field.type ?? "text"}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      )}

      {missingFields.length > 0 && (
        <p className="action-card__error">
          ⚠ Completa los campos requeridos antes de continuar.
        </p>
      )}

      {/* Body / message preview */}
      {bodyField && (
        <div className="action-card__body-preview">
          <textarea
            className="action-card__body-textarea"
            value={formState[bodyField.name] ?? ""}
            rows={3}
            onChange={(e) => handleChange(bodyField.name, e.target.value)}
          />
        </div>
      )}

      {/* Footer actions */}
      {actions.length > 0 && (
        <div className="action-card__footer">
          {actions.map((btn, index) => {
            const variant = getButtonVariant(btn.action, index);
            const prefix  = ACTION_ICONS[btn.action] ?? "";
            return (
              <button
                key={index}
                className={`action-card__btn action-card__btn--${variant}`}
                onClick={() => handleAction(btn.action)}
              >
                {variant === "danger" ? "✕" : `${prefix}${btn.label}`}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
