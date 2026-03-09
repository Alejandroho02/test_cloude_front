# Frontend — Asistente de Cotizaciones

Este repositorio contiene la interfaz de operador del asistente de cotizaciones. Permite chatear con Claude en streaming y ejecutar **Action Cards** interactivas que generan o manipulan cotizaciones.

> **Repo backend**: https://github.com/tu-Alejandroho02/test_cloude_backend

---

## Requisitos

- Node.js 18 o superior
- Backend corriendo en `http://localhost:8000` (ver repo backend)

---

## Instalación y uso

```bash
# clonar el repo
git clone https://github.com/tu-usuario/test_cloude_front.git
cd test_cloude_front

# instalar dependencias
npm install

# iniciar en modo desarrollo
npm run dev
```

El front quedará disponible en `http://localhost:5173`.

> ⚠️ No olvides levantar el backend antes de arrancar el frontend.

---

## Stack

| Tecnología | Rol |
|---|---|
| React 19 + TypeScript | UI y componentes |
| Vite 7 | Bundler / servidor dev |
| Redux Toolkit (+ RTK Query) | Estado global y datos |
| EventSource (SSE) | Streaming en tiempo real |
| SCSS | Estilos encapsulados |

---

## Estructura del proyecto

```
src/
├── Api/              # configuración base de peticiones
├── Components/       # componentes reutilizables
│   ├── ActionCard/   # tarjeta interactiva de IA
│   └── …             # otros componentes (Button, Sidebar, etc.)
├── Hooks/            # hooks personalizados (useChat)
├── interfaces/       # tipos TS (Message, Quote, …)
├── store/            # Redux store y slices
│   ├── chatSlice.ts  # mensajes y streaming
│   └── quotesSlice.ts# cotizaciones guardadas
├── Views/            # pantallas principales (Chat, …)
└── styles/           # estilos globales y variables
```

---

## Flujo principal

1. Operador escribe mensaje en el chat
2. `useChat.handleSend()` crea un `EventSource` al backend
3. SSE entrega chunks con texto y/o cards
4. `chatSlice` agrega el contenido en el store
5. Al detectar `<<<ACTION_CARD_START>>>…` se parsea JSON
6. Se renderiza un `ActionCard` editable debajo del mensaje
7. Operador completa campos y ejecuta una acción (ej. crear cotización)

---

## Action Cards

Las cards son bloques JSON incrustados por Claude entre delimitadores. No están
hardcodeadas: el frontend renderiza cualquier estructura que cumpla el esquema
básico (título, texto, formulario y botones).

**Acciones soportadas actualmente:**
`create_quote`, `send_email`, `acknowledge_flag`, `escalate`, `contact_supplier`, `discard`.

### Ejemplos de tipos comunes

- **Nueva Cotización** – campos como cliente, pieza, cantidad, entrega, etc.
- **Follow-up Email** – destinatario, asunto y borrador de mensaje.

Para añadir un nuevo tipo, basta con ajustar el prompt del backend; el UI lo
procesa automáticamente.

---

## Convenciones y decisiones técnicas

- **Delimitadores JSON** (`<<<ACTION_CARD_START>>>`) permiten streaming continuo
- **EventSource** se usa por su reconexión automática y sencillez
- **Redux + RTK Query** para separar estado y lógica de datos
- **ActionCard** es genérico y no depende de tipos específicos
- **Normalización**: todos los campos de cotización se almacenan en minúsculas
  para evitar fallos al mostrarlos

---

## Variables de entorno

El front sólo requiere apuntar a la URL del backend; no incluye ninguna clave.
El API key de Anthropic vive exclusivamente en el `.env` del backend.

```
VITE_BASE_URL=http://localhost:8000/api
# (no se debe commitear en frontend)
```

---

## Scripts npm

```bash
npm run dev      # desarrollo con HMR
npm run build    # build de producción
npm run preview  # sirve el build localmente
npm run lint     # ESLint
```

---

¡Listo! El README ahora refleja la configuración actual del proyecto.
