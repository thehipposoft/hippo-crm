# Hippo CRM

## Contexto del proyecto
CRM interno de The Hipposoft para un equipo de 3 personas (Diego, Gomi, Majo).
Maneja clientes, proyectos, pagos recibidos y costos fijos, más un tablero de
gráficos financieros. Menos de 100 clientes en el corto plazo.

Estructura, comandos y convenciones detalladas: ver `AGENTS.md`.

## Stack tecnológico
- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript strict
- **Estilos:** Tailwind CSS 4 (tokens de marca en `app/globals.css`)
- **Validación:** Zod 4 (`lib/validations/`)
- **Gráficos:** Recharts
- **Backend:** WordPress existente (`wp.thehipposoft.com`), REST API custom
  `hippo/v1` (`WP_API_URL`). Next.js solo consume, no aloja datos.
  El código del backend vive en el plugin de WordPress "Hippo CRM"
  (`wp-content/plugins/hippo-crm`, un archivo por área en `includes/`; no está en este repo).
- **Cliente de API:** `lib/wp.ts` — todo acceso al backend pasa por ahí
- **Auth:** token opaco emitido por WordPress, guardado en cookie httpOnly
  (`hippo_token`) — Next.js no lo valida, solo lo reenvía como `Bearer`
- **Hosting:** Netlify (`crm.thehipposoft.com`)
- **Package manager:** yarn

## Estilo de comunicación
- Comentarios en el código: cortos y directos, en español
- Sin frases de relleno — ser preciso
- Responder en español siempre

## Estilo de código
- Siempre TypeScript — nunca `any`
- Preferir arrow functions y `const`
- Componentes: exports nombrados, PascalCase (las `page.tsx` usan `export default`)
- Hooks: camelCase, prefijo `use`
- Sin números mágicos — usar constantes con nombre
- Sin estilos inline — clases Tailwind exclusivamente
- Orden de clases Tailwind: layout → espaciado → tipografía → visual → animación

## Principios de diseño
- Interfaz simple, moderna y dinámica
- Priorizar claridad de la información sobre decoración
- Mobile-first: sidebar desplegable y tablas con scroll horizontal en pantallas chicas
- Tema claro con la paleta del manual de marca Hippo (`app/globals.css`): `dark-text` (Midnight
  Blue, color principal: textos, botones y sidebar), `brand-blue` (Digital Sky, acento: foco,
  ítem activo, detalles), `brand-green`, `brand-orange`, `brand-lavender`, `brand-plum`,
  `brand-burgundy`, `brand-forest`, `brand-white` (fondo). Botón principal: `bg-dark-text text-white`
  (blanco sobre cian no tiene contraste). Modo oscuro: no implementado.
- Tipografías: Inter (body / UI, `font-sans`), `font-display` para títulos (hoy Inter; cuando
  esté la NewBlack Typeface se cambia en `globals.css`) y EB Garamond (`font-editorial`, acentos).
- Logo: `public/hippo-logo.svg` (y `-blanco` para fondos oscuros); ícono "H." en `app/icon.svg`.
  El punto cuadrado cian es el detalle de marca (títulos de documentos, ítem activo, viñetas).

## Autenticación
- Login vía `POST /api/login` → pega a `${WP_API_URL}/login` con `{ username, password }`
- La contraseña es una **Application Password** de WordPress (Usuarios → Perfil →
  Contraseñas de aplicación), no la contraseña normal del usuario
- 3 usuarios creados manualmente en WordPress (no hay registro público)
- WordPress devuelve un token (7 días) que se guarda en la cookie httpOnly
  `hippo_token`, junto con `hippo_user_name` (display name del usuario)
- Logout vía `POST /api/logout` — borra las cookies y redirige a /login
- El proxy (`proxy.ts`) redirige a /login si falta la cookie; con sesión, /login → /proyectos

## Modelo de datos
Tipos en `lib/types.ts`. WordPress los guarda como custom post types.

| Entidad  | Endpoints                                                    | Campos principales |
|----------|--------------------------------------------------------------|--------------------|
| Cliente  | `GET/POST /clientes`, `GET/PUT /clientes/:id`, `GET /clientes/:id/proyectos` | nombre, contacto, telefono, emailContacto, pais |
| Proyecto | `GET/POST /proyectos`, `GET/PUT /proyectos/:id`, `GET /proyectos/:id/pagos` | clienteId, estado, fechaInicio, deadline, tipoProyecto (ON_OFF \| RECURRENTE), valor, moneda, frecuenciaPago, url, accionPendiente, propuestaEnviada, propuestaAprobada (registro manual), archivos |
| Archivo de proyecto | `POST /proyectos/:id/archivos/ticket` → `{ url, maxMb }` (el navegador sube ahí, multipart `archivo`), `POST /archivos/:id/ticket` → `{ url }` (ver/bajar), `DELETE /archivos/:id` (vienen embebidos en el proyecto como `archivos`) | nombre, tipo (PROPUESTA \| CONTRATO \| OTRO), mime, tamano, subidoEl |
| Pago     | `GET/POST /pagos`, `GET/PUT/DELETE /pagos/:id`               | proyectoId, fecha, monto, moneda, medioPago, notas |
| Unidad   | `POST /unidades`, `GET/PUT/DELETE /unidades/:id` (vienen embebidas en el proyecto como `unidades`) | proyectoId, nombre, fechaAlta, fechaBaja, notas |
| Tarea    | `GET/POST /tareas`, `GET/PUT/DELETE /tareas/:id`, `GET /usuarios` (equipo: usuarios que entraron al CRM) | titulo, descripcion, estado (PENDIENTE \| EN_CURSO \| BLOQUEADA \| HECHA), prioridad (ALTA \| MEDIA \| BAJA), responsableId, fechaLimite, proyectoId, fechaHecha |
| Costo    | `GET/POST /costos`, `GET/PUT/DELETE /costos/:id` (DELETE manda a la papelera también sus pagos) | nombreCosto, categoria (SUELDO \| SUSCRIPCION \| HOSTING \| SERVICIO \| IMPUESTO \| OTRO), monto, moneda, frecuencia, metodoPago, fechaRenovacion, fechaInicio, fechaBaja, pagos |
| Propuesta / cotización | `GET/POST /propuestas`, `GET/PUT/DELETE /propuestas/:id` | tipo (PROPUESTA \| COTIZACION), titulo, resumen, clienteId, proyectoId, estado (BORRADOR \| ENVIADA \| ACEPTADA \| RECHAZADA), idioma (es \| en), moneda, fecha, fechaVencimiento, descuento, secciones [{titulo, contenido}], items [{descripcion, detalle, plazo, cantidad, precio}], cuentas (IDs), notas, token, enviadaEl, vistaEl, respondidaEl, respuestaNombre, respuestaComentario |
| Plantilla | `GET/POST /plantillas`, `GET/PUT/DELETE /plantillas/:id` | nombre, tipo, idioma, secciones, items, notas |
| Cuenta bancaria | `GET/POST /cuentas-bancarias`, `GET/PUT/DELETE /cuentas-bancarias/:id` | nombre, moneda (opcional), detalle (texto libre) |
| Pago de costo | `POST /pagos-costo` (con `costo_id`), `GET/PUT/DELETE /pagos-costo/:id` (vienen embebidos en el costo como `pagos`) | costoId, fecha, periodo ('YYYY-MM' o 'YYYY'), monto, moneda, metodoPago, notas |

- Link público: `POST/DELETE /clientes/:id/link-publico` (con login) y
  `GET /publico/estado-de-cuenta/:token` (sin login, sin notas ni acciones internas).
  El cliente trae `tokenPublico` cuando tiene link activo.
- Propuesta pública: `GET /publico/propuesta/:token` (404 si es BORRADOR; `?vista=0` no la marca
  como vista) y `POST /publico/propuesta/:token/respuesta` `{ accion: ACEPTAR | RECHAZAR, nombre, comentario }`
  (409 si ya fue respondida, 410 si venció). WordPress avisa por email (`HIPPO_CRM_EMAIL_AVISOS` en
  wp-config.php, o el email del admin).
- Archivos: privados en WordPress (carpeta `uploads/hippo-crm-privado`, bloqueada por .htaccess,
  nombres aleatorios). Se suben y se bajan directo entre el navegador y WordPress con tickets
  temporales (subida: 15 min, un uso; descarga: 5 min), porque Netlify corta los requests de más de
  ~6 MB. Máx. 25 MB; PDF, Word, PowerPoint, Keynote e imágenes.
- El **estado** es del proyecto, no del cliente:
  PROSPECTO | EN_NEGOCIACION | ACTIVO | EN_PAUSA | CERRADO | PERDIDO
- Monedas: USD | ARS | AUD | EUR. Frecuencias: SEMANAL | MENSUAL | ANUAL
- Las respuestas vienen en camelCase; los payloads de escritura van en snake_case
- No existen todavía: Notas, DELETE de clientes/proyectos.
  No inventar endpoints ni shapes hasta que WordPress los defina.

## Reglas de negocio (no romper)
- **Monedas:** nunca sumar montos de monedas distintas. El pendiente de un proyecto
  solo descuenta pagos en la moneda del proyecto; el resto se muestra aparte.
- **Pendiente de un proyecto:** lo calcula el CRM (`lib/proyectos.ts`), no WordPress.
  Recurrentes: `valor × períodos iniciados` desde `fechaInicio` hasta hoy (o hasta
  el deadline si ya pasó).
- **Cobro por unidad** (casillas, licencias): proyecto RECURRENTE mensual con `unidad`
  (ej. 'casilla'); `valor` = precio por unidad por mes. Cada mes calendario desde el inicio
  (o la primera alta) se cobra `unidades activas × valor`. "Mes completo": una unidad activa
  aunque sea un día del mes (alta o baja) cuenta todo el mes. Lógica en `lib/unidades.ts`.
- **Costos del mes:** semanal = monto × 52 / 12; anual = monto / 12. Solo cuentan
  los costos vigentes en el mes (entre `fechaInicio` y `fechaBaja`). Si el período tiene
  pagos registrados se usa lo pagado de verdad (+ lo que falte si es parcial); si no, el
  estimado. Lógica en `lib/costos.ts`.
- **Pagos de costos:** cada pago cubre un período (mes, o año si el costo es anual). Un pago
  en otra moneda da el período por pagado y se muestra aparte (nunca se suma).
- **Saldo:** pendiente > 0 = debe; ≈ 0 = "Al día"; < 0 = "a favor" (pagó de más o por adelantado).
- **Por cobrar:** solo cuenta proyectos ACTIVO, EN_PAUSA o CERRADO (un prospecto no es deuda).
- **Períodos recurrentes:** el período `n` empieza en `fechaInicio + n × frecuencia`; si el
  mes destino es más corto, cae en su último día (31/01 → 28/02).
- **Renovaciones de costos:** se toma `fechaRenovacion` y se corre según la frecuencia
  hasta la próxima fecha >= hoy.
- **Propuestas:** total = Σ cantidad × precio − descuento (nunca negativo; `lib/propuestas.ts`).
  Número = ID con prefijo (`P-000123` propuesta, `C-000123` cotización). Una ENVIADA con
  `fechaVencimiento` pasada se muestra VENCIDA (el día del vencimiento todavía vale). El cliente
  responde una sola vez; desde el CRM se puede marcar aceptada/rechazada a mano o reabrir
  (borra la respuesta). Abrir el link con sesión del CRM no cuenta como "vista".
- **Propuesta de un proyecto** (`lib/propuestaProyecto.ts`): enviada / aprobada = el registro manual
  del proyecto si existe (propuestas hechas fuera del CRM); si no, la primera propuesta del CRM
  vinculada (`proyectoId`) enviada / aceptada (día en Argentina). "Crear proyecto" desde una
  propuesta aceptada la deja vinculada al proyecto nuevo.
- **Fechas:** WordPress manda `'YYYY-MM-DD'`. Nunca `new Date('YYYY-MM-DD')`
  (se interpreta en UTC y en Argentina cae el día anterior): usar `lib/fechas.ts`
  y `lib/format.ts`. La zona horaria del negocio es `America/Argentina/Buenos_Aires`.

## Qué NO sugerir
- Class Components
- CSS Modules
- Redux, Zustand u otro estado global (no hace falta: los datos viven en WordPress)
- React Hook Form (los formularios usan server actions + Zod, ver `AGENTS.md`)
- `var`
- NextAuth (usamos auth por token vía cookie, emitido por WordPress)
- Registro público de usuarios
- Prisma / cualquier ORM (no hay base de datos propia — todo pasa por `lib/wp.ts`)
- Fetch directo a `WP_API_URL` fuera de `lib/wp.ts`

## Patrones preferidos
- **Lectura de datos:** Server Components con `wpGet()` / `wpGetONotFound()` (`lib/wp.ts`)
- **Escritura:** server actions en `actions.ts` con `validarFormulario()` + `enviarAWp()` (`lib/acciones.ts`)
- **Formularios:** un componente por entidad (`components/<entidad>/<Entidad>Form.tsx`)
  armado con `components/ui/Formulario.tsx`, usado para crear y para editar
- **Estado local:** useState / useReducer
- **Imágenes:** next/image con width y height explícitos

## Roadmap
### Hecho
- Login con auth por token (WordPress)
- CRUD de clientes, proyectos, pagos y costos
- Listado de proyectos con filtros por estado y búsqueda
- Pendiente por proyecto (on-off y recurrentes, por moneda)
- Gráficos: pagos por mes y por cliente, proyectos por estado, gastos del mes,
  resultado del mes por moneda
- Loading, error y 404; layout mobile; navegación con ítem activo
- Cambio rápido de estado de un proyecto desde el listado
- Saldo por proyecto (pendiente / al día / a favor)
- Ficha de cliente con resumen financiero
- Pagos filtrados por período y exportación a CSV
- Registro rápido de pagos con monto sugerido
- Recibos de pago y estado de cuenta (PDF, español/inglés) y link público para el cliente
- Cobro por unidad (casillas de correo): activas por mes, altas y bajas
- Pagos de costos (sueldos, suscripciones): registrar pago por período, estado del mes,
  historial, "Por pagar" en el dashboard y categorías
- Propuestas y cotizaciones: secciones libres con plantillas editables, ítems, descuento,
  cuentas bancarias por documento, link público con aceptar/rechazar (firma con nombre y aviso
  por email), PDF, historial (enviada, vista, respondida) y "Crear proyecto" desde una aceptada
- Sección "Propuesta" en la ficha del proyecto: fechas de envío y aprobación (del CRM o a mano),
  propuestas vinculadas y archivos (subir la propuesta en PDF, contratos, etc.)
- Nueva marca Hippo (2026): paleta, Inter, logo y documentos
- Tareas del equipo: tablero por estado, responsables, prioridad, fecha límite, vínculo a proyectos
- Dashboard "Hoy": por cobrar, cobrado y recurrentes del mes, deadlines, renovaciones,
  acciones pendientes y datos incompletos

### Pendiente
- Notas y timeline por cliente
- Totales consolidados en una moneda (tipo de cambio)

### Calidad
- Tests de la lógica en `lib/` con Vitest (`yarn test`) y CI en GitHub Actions
