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
  El código del backend vive en el `functions.php` del theme de WordPress,
  sección "HIPPO CRM IMPLEMENTACIÓN" (no está en este repo).
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
- Tema claro con los colores de marca (`brand-blue`, `brand-green`,
  `brand-orange`, `brand-white`, `dark-text`). Modo oscuro: no implementado.

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
| Proyecto | `GET/POST /proyectos`, `GET/PUT /proyectos/:id`, `GET /proyectos/:id/pagos` | clienteId, estado, fechaInicio, deadline, tipoProyecto (ON_OFF \| RECURRENTE), valor, moneda, frecuenciaPago, url, accionPendiente |
| Pago     | `GET/POST /pagos`, `GET/PUT/DELETE /pagos/:id`               | proyectoId, fecha, monto, moneda, medioPago, notas |
| Costo    | `GET/POST /costos`, `GET/PUT /costos/:id`                    | nombreCosto, monto, moneda, frecuencia, metodoPago, fechaRenovacion, fechaInicio, fechaBaja |

- Link público: `POST/DELETE /clientes/:id/link-publico` (con login) y
  `GET /publico/estado-de-cuenta/:token` (sin login, sin notas ni acciones internas).
  El cliente trae `tokenPublico` cuando tiene link activo.
- El **estado** es del proyecto, no del cliente:
  PROSPECTO | EN_NEGOCIACION | ACTIVO | EN_PAUSA | CERRADO | PERDIDO
- Monedas: USD | ARS | AUD | EUR. Frecuencias: SEMANAL | MENSUAL | ANUAL
- Las respuestas vienen en camelCase; los payloads de escritura van en snake_case
- No existen todavía: Notas, Cotizaciones, DELETE de clientes/proyectos/costos.
  No inventar endpoints ni shapes hasta que WordPress los defina.

## Reglas de negocio (no romper)
- **Monedas:** nunca sumar montos de monedas distintas. El pendiente de un proyecto
  solo descuenta pagos en la moneda del proyecto; el resto se muestra aparte.
- **Pendiente de un proyecto:** lo calcula el CRM (`lib/proyectos.ts`), no WordPress.
  Recurrentes: `valor × períodos iniciados` desde `fechaInicio` hasta hoy (o hasta
  el deadline si ya pasó).
- **Costos del mes:** semanal = monto × 52 / 12; anual = monto / 12. Solo cuentan
  los costos vigentes en el mes (entre `fechaInicio` y `fechaBaja`).
- **Saldo:** pendiente > 0 = debe; ≈ 0 = "Al día"; < 0 = "a favor" (pagó de más o por adelantado).
- **Por cobrar:** solo cuenta proyectos ACTIVO, EN_PAUSA o CERRADO (un prospecto no es deuda).
- **Períodos recurrentes:** el período `n` empieza en `fechaInicio + n × frecuencia`; si el
  mes destino es más corto, cae en su último día (31/01 → 28/02).
- **Renovaciones de costos:** se toma `fechaRenovacion` y se corre según la frecuencia
  hasta la próxima fecha >= hoy.
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
- Dashboard "Hoy": por cobrar, cobrado y recurrentes del mes, deadlines, renovaciones,
  acciones pendientes y datos incompletos

### Pendiente
- Notas y timeline por cliente
- Cotizaciones
- Totales consolidados en una moneda (tipo de cambio)

### Calidad
- Tests de la lógica en `lib/` con Vitest (`yarn test`) y CI en GitHub Actions
