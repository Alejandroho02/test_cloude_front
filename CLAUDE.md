# Frontend — Asistente de Cotizaciones

## Stack
React 19 + TypeScript + Vite 7 + Redux Toolkit + SCSS

## Comandos
```bash
npm run dev     # desarrollo
npm run build   # producción
npm run lint    # ESLint
```

## Variable de entorno
```
VITE_BASE_URL=http://localhost:8000/api   # (.env)
```

## Archivos clave

| Archivo | Qué hace |
|---|---|
| `src/Hooks/useChat.tsx` | Lógica principal: SSE streaming, envío de mensajes, manejo de action cards |
| `src/Views/Chat/Chat.tsx` | Vista del chat: renderiza mensajes, textarea, botones |
| `src/store/slices/chatSlice.ts` | Estado Redux: `messages`, `isStreaming`. Reducers: `addUserMessage`, `startAssistantMessage`, `appendChunk`, `stopStreaming` |
| `src/Components/ActionCard/ActionCard.tsx` | Tarjeta de acción con form editable y botones. Props: `title`, `text[]`, `form[]`, `actions[]`, `status`, `onAction` |
| `src/interfaces/message.ts` | Tipo `Message` (`role`, `content`) |
| `src/Api/RequestApi.tsx` | RTK Query setup (actualmente sin uso activo, el chat usa EventSource directo) |

## Flujo de datos
1. Usuario escribe → `handleSend()` en `useChat`
2. Se crea `EventSource` hacia `GET /chat?message=...&history=<base64>`
3. El SSE va despachando chunks → `appendChunk()` en Redux
4. Al terminar el stream → `stopStreaming()`
5. El contenido del último mensaje assistant se parsea buscando `<<<ACTION_CARD_START>>>...JSON...<<<ACTION_CARD_END>>>` → se muestran como `ActionCard`

## Action Cards
El backend embebe tarjetas en el texto con ese delimitador. Acciones soportadas en `useChat.handleCardAction`:
- `create_quote`, `send_email`, `acknowledge_flag`, `escalate`, `contact_supplier`, `discard`

**Nota:** En `Chat.tsx` el renderizado de cards por mensaje está comentado (líneas 162–174). Las cards del último mensaje sí se muestran via `sideCards`.

## Convenciones
- Componentes en `src/Components/<Nombre>/<Nombre>.tsx` + `<nombre>.scss` co-localizado
- Hooks en `src/Hooks/`
- No usar `any` salvo donde el JSON del backend es dinámico (parseCards)
