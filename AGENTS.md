# Agentes del proyecto — CRM

## Stack
- Framework: Next.js 14+ (App Router)
- Lenguaje: TypeScript (modo strict)
- Estilos: Tailwind CSS (utility-first, sin estilos inline)
- Backend: WordPress existente (wp.thehipposoft.com), vía REST API custom (`/wp-json/hippo/v1`)
- Auth: token opaco emitido por WordPress, guardado en cookie httpOnly (`hippo_token`) — Next.js no lo valida, solo lo reenvía

## Estructura del proyecto
```
app/
  (auth)/
    login/          → página de login
  (crm)/
    dashboard/      → métricas generales
    clientes/
      page.tsx      → listado con filtros
      [id]/
        page.tsx    → ficha de cliente
    cotizaciones/   → gestión de cotizaciones
  api/              → route handlers si son necesarios
  middleware.ts     → protección de rutas

components/
  ui/               → componentes base (Button, Badge, Input, Modal)
  clientes/         → ClientCard, ClientTable, ClientForm, StatusBadge
  notas/            → NotesList, NoteForm, Timeline
  pagos/            → PaymentTracker, PaymentForm
  cotizaciones/     → QuoteCard, QuoteForm
  layout/           → Sidebar, Header, PageWrapper

lib/
  wp.ts             → wpFetch(path, token?, options?) — cliente de la REST API de WordPress
  types.ts          → tipos de Cliente, Nota, Pago, Cotizacion
  validations/      → schemas Zod
  constants.ts      → estados, colores de badges, etc.
  utils.ts          → helpers generales
```

## Comandos
- `npm run dev`       → servidor de desarrollo
- `npm run build`     → build de producción
- `npm run lint`      → ESLint
- `npm run typecheck` → tsc --noEmit

## Variables de entorno necesarias
```
WP_API_URL=
```

## Reglas para tareas autónomas
- No modificar `app/layout.tsx` sin preguntar antes
- No eliminar archivos — solo renombrar o refactorizar
- Siempre ejecutar typecheck antes de dar una tarea por terminada
- Si hay dudas sobre diseño o modelo de datos, preguntar antes de implementar
- El middleware de auth vive en `middleware.ts` (raíz del proyecto) — no moverlo
- Toda validación de formularios usa Zod — nunca validación manual
- Los server actions van en archivos separados con sufijo `.actions.ts`

## Convenciones de estados
Los estados de cliente tienen colores fijos definidos en `lib/constants.ts`:
- PROSPECTO → azul
- EN_NEGOCIACION → amarillo
- ACTIVO → verde
- EN_PAUSA → gris
- CERRADO → violeta
- PERDIDO → rojo

## Convenciones de la API de WordPress
- Todo acceso al backend pasa por `wpFetch` (`lib/wp.ts`) — nunca hacer `fetch` directo a `WP_API_URL`
- El contrato de endpoints (paths, shapes de request/response) lo define WordPress — no inventar campos ni rutas nuevas sin confirmarlo primero
- El token es opaco: Next.js no lo decodifica ni valida, solo lo guarda en cookie y lo reenvía en `Authorization: Bearer`

## Convenciones de autenticación
- Login: `app/api/login/route.ts` — pega a `${WP_API_URL}/login`, guarda `hippo_token` y `hippo_user_name` en cookies httpOnly (7 días)
- Logout: `app/api/logout/route.ts` — borra ambas cookies y redirige a `/login`
- El middleware (raíz) redirige a `/login` si falta la cookie `hippo_token`, y a `/clientes` si hay cookie y se intenta entrar a `/login`