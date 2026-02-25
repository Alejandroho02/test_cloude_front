# Radii Copilot — Frontend

Copilot interno. Permite a los operadores chatear con Claude, ver las respuestas en streaming en tiempo real y ejecutar **Action Cards** interactivas sin salir del chat.

> **Repo backend:** [test_cloude_backend](https://github.com/tu-usuario/test_cloude_backend)

---

## Demo


<p aling="center">
  <img src="./assets/preview_app_video.gif" width="700" />
</p>

<p aling="center">
  <img src="./assets/preview_app_image.png" width="700" />
</p>


---

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:8000` (ver repo backend)

---

## Instalación y uso

```bash
# 1. Clonar el repo
git clone https://github.com/tu-usuario/test_cloude_frontend.git
cd test_cloude_frontend

# 2. Instalar dependencias
npm install

# 3. Correr en desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

> ⚠️ Asegúrate de que el backend esté corriendo antes de iniciar el frontend.

---

## Stack

| Tecnología | Uso |
|---|---|
| React 18 + TypeScript | UI y componentes |
| Vite | Bundler y dev server |
| Redux Toolkit + RTK Query | State management |
| EventSource (SSE) | Consumo del streaming |
| SCSS | Estilos por componente |

---

## Estructura del proyecto

```
src/
├── Api/              # Configuración base de llamadas HTTP
├── Components/       # Componentes reutilizables
│   ├── ActionCard/   # Card interactiva generada por IA
│   └── Input/        # Input genérico
├── Hooks/
│   └── useChat.ts    # Hook principal — streaming + parsing de cards
├── interfaces/
│   └── message.ts    # Tipos TypeScript
├── store/
│   ├── store.ts      # Configuración del store Redux
│   ├── chatSlice.ts  # Estado de mensajes y streaming
│   └── chatApi.ts    # RTK Query API slice
├── styles/           # Estilos globales
└── Views/            # Páginas / layouts principales
```

---

## Flujo de la aplicación

```
Operador escribe mensaje
        ↓
useChat.handleSend()
        ↓
EventSource → GET /api/chat?message=...&history=...
        ↓
Chunks llegan por SSE → dispatch(appendChunk)
        ↓
Parser detecta <<<ACTION_CARD_START>>> ... <<<ACTION_CARD_END>>>
        ↓
ActionCard se renderiza con los datos extraídos
        ↓
Operador edita campos / ejecuta acción
```

---

## Action Cards

Las cards son generadas dinámicamente a partir del output estructurado de Claude. No están hardcodeadas — el componente `ActionCard` recibe props y renderiza cualquier tipo de card.

### Tipos soportados

| Tipo | Campos | Acciones |
|---|---|---|
| **Nueva Cotización** | Cliente, Pieza, Material, Cantidad, Dimensiones, Entrega, Industria | Crear cotización, Editar, Descartar |
| **Follow-up Email** | Destinatario, Asunto, Borrador | Enviar, Editar, Descartar |

### Agregar un nuevo tipo de card

El componente es completamente genérico — solo necesitas actualizar el system prompt del backend para que Claude incluya los nuevos campos en el JSON. El frontend los renderiza automáticamente sin cambios en el código.

---

## Decisiones técnicas

### 1. Streaming con EventSource (SSE)

Claude API soporta streaming via Server-Sent Events. El backend actúa como proxy y reenvía los chunks al frontend. Se eligió `EventSource` nativo sobre `fetch` con `ReadableStream` por su manejo automático de reconexión y simplicidad de implementación.

### 2. Delimitadores para Action Cards (`<<<ACTION_CARD_START>>>`)

Se evaluaron tres enfoques:

| Approach | Pros | Contras |
|---|---|---|
| **Tool use de Claude** | Estructura garantizada | Corta el streaming, latencia mayor |
| **JSON delimitado** ✅ | Compatible con streaming, simple de parsear | Requiere prompt engineering cuidadoso |
| **Parsing heurístico** | Flexible | Frágil, difícil de mantener |

Se eligió JSON con delimitadores porque es el único approach compatible con streaming en tiempo real — las cards aparecen conforme Claude las genera, sin esperar a que termine la respuesta.

### 3. RTK Query + Redux Toolkit para state management

El estado de la conversación (mensajes, isStreaming) vive en un Redux slice (`chatSlice`). RTK Query gestiona la capa de datos y permite escalar fácilmente a caché, invalidación y queries derivadas. El SSE se integra como efecto dentro del hook `useChat`, despachando acciones al slice conforme llegan los chunks.

### 4. Componente ActionCard genérico

`ActionCard` recibe `title`, `text[]`, `form[]` y `actions[]` como props — no tiene lógica específica de ningún tipo de card. Esto permite agregar nuevos tipos de cards únicamente desde el system prompt del backend, sin tocar el frontend.

### 5. Separación de concerns

- `useChat` — orquesta streaming, parsing y estado
- `chatSlice` — estado puro, sin side effects
- `ActionCard` — presentación y edición de campos
- `chatApi` — capa de datos con RTK Query

---

## Variables de entorno

El front en no expone la api de cloude unicamente es modificar tu direccion ip hacia donde apunta tu backend en en el puerto 8000

```
# Backend .env (nunca en el frontend)
ANTHROPIC_API_KEY=sk-...
```

---

## Scripts disponibles

```bash
npm run dev      # Desarrollo con HMR
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # ESLint
```