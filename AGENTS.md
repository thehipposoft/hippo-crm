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
    page.tsx                  → dashboard "Hoy" (cobros, deadlines, renovaciones, acciones)
    clientes/ proyectos/ pagos/ costos/
      page.tsx                → listado
      nuevo/page.tsx          → alta (+ actions.ts)
      [id]/page.tsx           → ficha
      [id]/editar/page.tsx    → edición (+ actions.ts)
    propuestas/               → propuestas y cotizaciones: listado, nueva, [id] (ficha), [id]/editar,
                                plantillas/ y cuentas/ (cuentas bancarias), actions.ts en cada una
    graficos/                 → tablero financiero
    loading.tsx               → esqueleto mientras carga WordPress
    error.tsx                 → error con botón de reintentar
    not-found.tsx             → 404 (fichas inexistentes)
  documentos/                 → recibos, estados de cuenta y vista previa de propuestas (con login, sin sidebar)
    recibo/[pagoId]/
    propuesta/[id]/             (vista previa interna, también de borradores)
    estado-de-cuenta/[clienteId]/   (+ LinkPublico y sus actions)
  estado/[token]/             → link público del cliente: estado de cuenta y recibos (SIN login)
  propuesta/[token]/          → link público de una propuesta o cotización, con aceptar/rechazar (SIN login)
  api/login, api/logout       → route handlers de sesión
proxy.ts                      → protección de rutas (ex middleware.ts, convención de Next 16)

components/
  layout/                     → Sidebar (desktop fija, mobile desplegable, ítem activo)
  ui/                         → Formulario (Formulario, Campo, Input, Select, Textarea,
                                FilaCampos), PaginaFormulario, PageHeader, Field, SearchInput,
                                FilaTabla + ContenedorTabla, Orden (Th, ThOrdenable), RowActions,
                                ConfirmDialog, Paneles (Seccion, FilaLista, FechaRelativa, TarjetaMontos),
                                useParamsUrl
  clientes/ proyectos/ pagos/ costos/
                              → <Entidad>Form, <Entidades>Table (+ RowActions propios
                                en pagos y proyectos)
  graficos/                   → charts (Recharts) y cards del tablero
  home/                       → HomeDashboard
  unidades/                   → SeccionUnidades (ficha del proyecto), ListaUnidades, formularios
  tareas/                     → TareasBoard, TareaCard, TareaForm, TareasProyecto
  documentos/                 → HojaDocumento, BarraDocumento, Recibo, EstadoDeCuentaDoc,
                                PropuestaDocumento, RespuestaPropuesta, Markdown
  propuestas/                 → PropuestaForm, EditorSecciones, EditorItems, PlantillaForm, CuentaForm,
                                PropuestasTable, AccionesPropuesta, EstadoPropuestaBadge, SubnavPropuestas

lib/
  wp.ts                       → wpFetch, wpGet, wpGetONotFound — único acceso a WordPress
  acciones.ts                 → validarFormulario, enviarAWp (solo server)
  formularios.ts              → EstadoFormulario y tipos compartidos server/cliente
  validations/                → schemas Zod por entidad (salida = payload de WordPress) y validarFormulario
  auth.ts                     → getToken, getNombreUsuario (solo server)
  cookies.ts                  → nombres de cookies y duración (sin imports: lo usa el proxy)
  types.ts                    → tipos de las entidades y constantes (estados, monedas, etc.)
  fechas.ts                   → fechas de calendario sin hora, "hoy" en zona Argentina
  format.ts                   → formatFecha, formatMonto, aInputFecha
  proyectos.ts                → moneda del proyecto, períodos, saldo y cobro de recurrentes
  dashboard.ts                → cálculos del dashboard (deadlines, renovaciones, por cobrar, recurrentes)
  analytics.ts                → agregaciones para los gráficos y costos del mes
  propuestas.ts               → totales, número, estado visible (vencida), plantillas base, cuentas sugeridas
  propuestasServer.ts         → datos del form de propuestas (solo server)
  markdown.ts                 → formato simple de las secciones (negrita, listas, subtítulos, tablas)
  costos.ts                   → pagos de costos: períodos, estado (pagado/parcial/pendiente), sugerencia, por pagar
  pagosCosto.ts               → opciones del selector de período del form de pago de un costo
  navegacion.ts               → ítems del menú
  orden.ts                    → orden de tablas (estable, vacíos al final)
  periodos.ts                 → períodos de fechas (este mes, año pasado, rango…)
  csv.ts                      → exportar CSV (;  coma decimal, BOM)
  clientes.ts                 → resumen financiero del cliente
  unidades.ts                 → cobro por unidad: activas por mes, meses facturables, adeudado
  tareas.ts                   → tareas: agrupar por estado, orden de trabajo, filtros, urgentes
  empresa.ts                  → datos del emisor en recibos y estados de cuenta
  publico.ts                  → datos del link público (token)
  documentos/                 → idioma (es/en), textos y armado del estado de cuenta
```

## Comandos
- `yarn dev`        → servidor de desarrollo (http://localhost:3000)
- `yarn build`      → build de producción
- `yarn lint`       → ESLint
- `yarn typecheck`  → tsc --noEmit
- `yarn test`       → tests de `lib/` (Vitest)
- `yarn test:watch` → tests en modo watch

## Variables de entorno necesarias
En `.env.local` (no se commitea):
```
WP_API_URL=https://wp.thehipposoft.com/wp-json/hippo/v1
```
En local se trabaja contra los datos reales de producción: cuidado al crear, editar o borrar.

## Reglas para tareas autónomas
- No modificar `app/layout.tsx` sin preguntar antes
- No eliminar archivos sin confirmarlo — preferir renombrar o refactorizar
- Siempre ejecutar `yarn typecheck`, `yarn lint` y `yarn test` antes de dar una tarea por terminada
- Todo cambio en la lógica de `lib/` (plata, fechas, validaciones, orden) va con su test
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

## Tests
- Vitest, en `lib/**/*.test.ts`, junto al archivo que prueban (`fechas.ts` → `fechas.test.ts`)
- Corren con zona horaria de Argentina (`vitest.config.mts`): ahí aparecían los bugs de fechas
- Fechas fijas: pasar `fechaHoy` a las funciones que la aceptan, o `vi.setSystemTime`
- Datos de prueba con los helpers de `lib/test-utils.ts` (`proyecto()`, `pago()`, `costo()`, `fecha()`)
- Lo que importa Next (`next/headers`, `next/navigation`) no se testea acá: la lógica
  testeable vive en módulos sin dependencias de Next (ej. `lib/validations/validar.ts`)
- CI: `.github/workflows/ci.yml` corre typecheck, lint, tests y build en cada push a master y en cada PR

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

## Convenciones de UI
- Tablas: `ContenedorTabla` (scroll horizontal en mobile) + `FilaTabla` por fila. La
  primera columna lleva un `<Link>` a la ficha (teclado y abrir en otra pestaña);
  la celda de acciones lleva `data-sin-navegar`
- Menú de acciones de las filas: `RowActions` (ver, editar, eliminar opcional, ítems extra)
- Orden de columnas: `useOrdenTabla` + `ThOrdenable` (`components/ui/Orden.tsx`), con las
  columnas definidas en un objeto `COLUMNAS` (`lib/orden.ts`). El orden vive en la URL
  (`?orden=&dir=`) y se cambia sin volver a pedir datos. Montos: ordenar por `[moneda, monto]`;
  fechas: con `claveFecha()`. Los vacíos van siempre al final
- Confirmaciones: `ConfirmDialog`, nunca `window.confirm` ni `window.alert`
- Mobile-first: padding `px-4 sm:px-8`, grillas que colapsan a una columna

## Documentos y link público
- "Descargar PDF" = impresión del navegador (`window.print()`); la barra lleva `print:hidden`
- Idioma: `?idioma=es|en`; si no viene, según el país del cliente (`idiomaPara`)
- Montos en documentos con código de moneda (`montoDoc`): "USD 1.500,00", nunca "$"
- Número de recibo = ID del pago en WordPress (`R-000123`)
- `/estado/[token]` es público (excepción en `proxy.ts`): nunca mostrar notas de pagos,
  acciones pendientes ni datos que no sean del cliente del token. WordPress ya los quita.
- Datos del emisor (nombre, web, email, ID fiscal) en `lib/empresa.ts`

## Propuestas y cotizaciones
- Ítems, secciones y cuentas viajan como JSON en inputs hidden (`items`, `secciones`, `cuentas`); los
  arman `EditorItems` / `EditorSecciones` y los valida `propuestaSchema`
- Secciones: formato simple de `lib/markdown.ts`, renderizado con React (`Markdown`), nunca HTML crudo
- Plantillas base en código (`PLANTILLAS_BASE`) + las guardadas en WordPress; en el alta se elige una
- El contenido del documento va en el idioma de la propuesta (`idioma`), sin selector de idioma
- `/propuesta/[token]` es público (excepción en `proxy.ts`, ojo: no es `/propuestas`): solo muestra lo
  que devuelve WordPress (`PropuestaPublica`); un BORRADOR da 404. Con cookie del CRM se pide con
  `?vista=0` para no marcarla como vista
- Al imprimir, la portada de la propuesta ocupa la primera página y la inversión arranca en página nueva

## Pagos de costos
- Cada pago (`PagoCostoRow`) cubre un **período**: `'YYYY-MM'` (mensual y semanal) o `'YYYY'` (anual).
  Se elige en el form; por defecto, el pendiente más viejo con lo que falta (`sugerenciaPagoCosto`)
- Estado del período (`resumenPeriodo`): PAGADO si lo pagado en la moneda del costo cubre lo
  esperado (o si hay un pago en otra moneda: no se puede comparar), PARCIAL si hay algo, si no PENDIENTE
- Se esperan pagos desde el primer período con pago registrado (nunca antes del alta): un costo
  viejo sin pagos cargados solo muestra el período actual, no un año de deuda
- Rutas: `/costos/[id]/pagos/nuevo?periodo=&volver=` y `/costos/[id]/pagos/[pagoId]/editar`
- Funciones de `lib/` que use un Server Component no pueden vivir en un archivo `'use client'`
  (ej. `labelCategoria` está en `lib/costos.ts`, no en `CostosTable`)

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
- El proxy (`proxy.ts`, raíz) redirige a `/login` si falta la cookie `hippo_token`, y a `/proyectos` si hay cookie y se intenta entrar a `/login`
- Nombres de cookies: siempre desde `lib/cookies.ts`; el token en server, con `getToken()`
