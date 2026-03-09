import { ia_icon } from "../../data/img-data.tsx";
import "./welcomecard.scss";

const QUICK_ACTIONS = [
  { icon: "◻", label: "Crear una cotización", message: "Quiero crear una nueva cotización" },
  { icon: "💲", label: "Consultar precios", message: "Necesito consultar precios de materiales" },
  { icon: "📦", label: "Seguimiento de pedido", message: "Quiero hacer seguimiento de un pedido" },
  { icon: "✉", label: "Enviar cotización por email", message: "Quiero enviar una cotización por email" },
];

interface WelcomeCardProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

export const WelcomeCard = ({ onAction, disabled }: WelcomeCardProps) => {
  return (
    <div className="welcome-card">
      <div className="welcome-card__header">
        <img className="welcome-card__avatar" src={ia_icon.url} alt={ia_icon.alt} />
        <div>
          <h2 className="welcome-card__title">¡Hola! Soy tu asistente de cotizaciones</h2>
          <p className="welcome-card__subtitle">
            Puedo ayudarte a crear cotizaciones, consultar precios y gestionar tus pedidos.
          </p>
        </div>
      </div>

      <p className="welcome-card__prompt">¿Cómo te puedo ayudar hoy?</p>

      <div className="welcome-card__actions">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.message}
            className="welcome-card__btn"
            disabled={disabled}
            onClick={() => onAction(action.message)}
          >
            <span className="welcome-card__btn-icon">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};
