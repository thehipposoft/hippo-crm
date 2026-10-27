# Agentes del proyecto — Hippo CRM

Contexto, modelo de datos y reglas de negocio: ver `CLAUDE.md`.

## Stack
- Framework: Next.js 16 (App Router), React 19
- Lenguaje: TypeScript (modo strict)
- Estilos: Tailwind CSS 4 (utility-first, sin estilos inline)
- Validación: Zod 4
- Backend: WordPress existente (wp.thehipposoft.com), REST API custom (`/wp-json/hippo/v1`)
- Auth: token opaco emitido por WordPress, guardado en cookie httpOnly (`hippo_token`) — Next.js no lo valida, solo lo reenvía

## Estructura del proyecto
```
app/
  (auth)/login/               → página de login
  (crm)/
    layout.tsx                → sidebar + chequeo de sesión
    page.tsx                  → dashboard de inicio
    clientes/ proyectos/ pagos/ costos/
      page.tsx                → listado
      nuevo/page.tsx          → alta (+ actions.ts)
      [id]/page.tsx           → ficha
      [id]/editar/page.tsx    → edición (+ actions.ts)
    graficos/                 → tablero financiero
  api/login, api/logout       → route handlers de sesión
middleware.ts                 → protección de rutas (raíz del proyecto)

components/
  ui/                         → Formulario (Formulario, Campo, Input, Select, Textarea,
                                FilaCampos), PaginaFormulario, PageHeader, Field, SearchInput
  clientes/ proyectos/ pagos/ costos/
                              → <Entidad>Form, <Entidades>Table, <Entidad>RowActions
  graficos/                   → charts (Recharts) y cards del tablero
  home/                       → HomeDashboard

lib/
  wp.ts                       → wpFetch, wpGet, wpGetONotFound — único acceso a WordPress
  acciones.ts                 → validarFormulario, enviarAWp (solo server)
  formularios.ts              → EstadoFormulario y tipos compartidos server/cliente
  validations/                → schemas Zod por entidad (salida = payload de WordPress)
  auth.ts                     → getToken, getNombreUsuario (solo server)
  cookies.ts                  → nombres de cookies y duración (sin imports: lo usa el middleware)
  types.ts                    → tipos de las entidades y constantes (estados, monedas, etc.)
  fechas.ts                   → fechas de calendario sin hora, "hoy" en zona Argentina
  format.ts                   → formatFecha, formatMonto, aInputFecha
  proyectos.ts                → moneda del proyecto y cálculo de pendiente
  analytics.ts                → agregaciones para los gráficos y costos vigentes
  navegacion.ts               → ítems del menú (sidebar y atajos del dashboard)
```

## Comandos
- `yarn dev`        → servidor de desarrollo (http://localhost:3000)
- `yarn build`      → build de producción
- `yarn lint`       → ESLint
- `yarn typecheck`  → tsc --noEmit

## Variables de entorno necesarias
En `.env.local` (no se commitea):
```
WP_API_URL=https://wp.thehipposoft.com/wp-json/hippo/v1
```
En local se trabaja contra los datos reales de producción: cuidado al crear, editar o borrar.

## Reglas para tareas autónomas
- No modificar `app/layout.tsx` sin preguntar antes
- No eliminar archivos sin confirmarlo — preferir renombrar o refactorizar
- Siempre ejecutar `yarn typecheck` y `yarn lint` antes de dar una tarea por terminada
- Si hay dudas sobre diseño o modelo de datos, preguntar antes de implementar
- Toda validación de formularios usa Zod (`lib/validations/`) — nunca validación manual
- Las server actions van en un `actions.ts` junto a la ruta que las usa (`nuevo/`, `[id]/editar/`)
- Si un cambio necesita un campo o endpoint nuevo en WordPress, se especifica el
  cambio de `functions.php` aparte: no asumir que ya existe

## Cómo agregar o cambiar un campo
1. WordPress (`functions.php`): agregarlo a la lista de campos de la entidad y al `*_to_array`
2. `lib/types.ts`: agregarlo al tipo `*Row` (camelCase)
3. `lib/validations/<entidad>.ts`: agregarlo al schema (snake_case, como lo espera WordPress)
4. `components/<entidad>/<Entidad>Form.tsx`: agregar el `<Campo>` con el mismo `name`
5. Mostrarlo en la ficha (`app/(crm)/<entidad>/[id]/page.tsx`) si corresponde

## Convenciones de formularios
- Un formulario por entidad, con props `accion`, `textoBoton` y la entidad opcional
  (sin entidad = alta, con entidad = edición)
- Los `name` de los inputs son las keys del schema Zod (snake_case)
- `Formulario` envía con `onSubmit` + `startTransition` para que React no resetee
  los campos: si el server devuelve errores, lo escrito se mantiene
- Los errores por campo los muestra `Campo` (mismo `nombre` que el input); el
  mensaje general va debajo del formulario
- Las server actions devuelven `EstadoFormulario` y, si sale bien, hacen
  `revalidatePath` + `redirect`

## Convenciones de estados
Los colores de cada estado están en `components/proyectos/StatusBadge.tsx`:
- PROSPECTO → gris
- EN_NEGOCIACION → naranja (brand-orange)
- ACTIVO → verde (brand-green)
- EN_PAUSA → gris claro
- CERRADO → celeste (brand-blue)
- PERDIDO → rojo

## Convenciones de la API de WordPress
- Todo acceso al backend pasa por `lib/wp.ts` — nunca hacer `fetch` directo a `WP_API_URL`
- El contrato de endpoints (paths, shapes de request/response) lo define WordPress — no inventar campos ni rutas nuevas sin confirmarlo primero
- Respuestas en camelCase, payloads de escritura en snake_case
- En los PUT, mandar `null` borra el campo en WordPress
- El token es opaco: Next.js no lo decodifica ni valida, solo lo guarda en cookie y lo reenvía en `Authorization: Bearer`

## Convenciones de autenticación
- Login: `app/api/login/route.ts` — pega a `${WP_API_URL}/login` con usuario + Application Password, guarda `hippo_token` y `hippo_user_name` en cookies httpOnly (7 días)
- Logout: `app/api/logout/route.ts` — borra ambas cookies y redirige a `/login`
- El middleware (`middleware.ts`, raíz) redirige a `/login` si falta la cookie `hippo_token`, y a `/proyectos` si hay cookie y se intenta entrar a `/login`
- Nombres de cookies: siempre desde `lib/cookies.ts`; el token en server, con `getToken()`
