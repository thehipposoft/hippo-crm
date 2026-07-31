# CRM — Gestión de Clientes

## Contexto del proyecto
CRM interno para un equipo de 3 personas. Manejo de clientes, estados,
fechas de etapas, cotizaciones, pagos y notas. Menos de 100 clientes
en el corto plazo.

## Stack tecnológico
- **Frontend:** Next.js 14+ (App Router) + TypeScript strict
- **Estilos:** Tailwind CSS
- **Backend:** WordPress existente (`wp.thehipposoft.com`), vía REST API custom
  (`WP_API_URL`, ej. `/wp-json/hippo/v1`) — Next.js solo consume, no aloja datos
- **Cliente de API:** `lib/wp.ts` (`wpFetch`) — todo acceso al backend pasa por ahí
- **Auth:** token opaco emitido por WordPress, guardado en cookie httpOnly
  (`hippo_token`) — Next.js no lo valida, solo lo reenvía como `Bearer`
- **Hosting:** Netlify

## Estilo de comunicación
- Comentarios en el código: cortos y directos
- Sin frases de relleno — ser preciso
- Responder en español siempre

## Estilo de código
- Siempre TypeScript — nunca `any`
- Preferir arrow functions y `const`
- Componentes: exports nombrados, PascalCase
- Hooks: camelCase, prefijo `use`
- Sin números mágicos — usar constantes con nombre
- Sin estilos inline — clases Tailwind exclusivamente
- Orden de clases Tailwind: layout → espaciado → tipografía → visual → animación

## Principios de diseño
- Interfaz simple, moderna y dinámica
- Priorizar claridad de la información sobre decoración
- Mobile-first
- Modo oscuro por defecto

## Autenticación
- Login vía `POST /api/login` → pega a `${WP_API_URL}/login` con `{ username, password }`
- 3 usuarios creados manualmente en WordPress (no hay registro público)
- El token que devuelve WordPress se guarda en cookie httpOnly `hippo_token` (7 días);
  es opaco, Next.js no lo decodifica
- Logout vía `POST /api/logout` — borra la cookie y redirige a /login
- Middleware (`middleware.ts`, raíz) protege todas las rutas — redirige a /login si
  falta la cookie `hippo_token`

## Modelo de datos principal

### Cliente (expuesto hoy por `GET /clientes`)
- id, nombre, empresa, estado, fechaInicio, deadline, accionPendiente
- estado: PROSPECTO | EN_NEGOCIACION | ACTIVO | EN_PAUSA | CERRADO | PERDIDO

### Nota, Cotizacion, Pago
- Todavía no expuestos por la API de WordPress — son roadmap de Fase 2/3.
  No inventar estos endpoints ni sus shapes hasta que WordPress los defina.

## Qué NO sugerir
- Class Components
- CSS Modules
- Redux
- `var`
- NextAuth (usamos auth por token vía cookie, emitido por WordPress)
- Registro público de usuarios
- Prisma / cualquier ORM (no hay base de datos propia — todo pasa por `wpFetch`)
- Fetch directo a `WP_API_URL` fuera de `lib/wp.ts`

## Patrones preferidos
- Data fetching: React Server Components + fetch con cache
- Estado local: useState / useReducer
- Estado global: Zustand
- Formularios: React Hook Form + Zod
- Imágenes: next/image con width y height explícitos

## Roadmap
### Fase 1 — MVP
- Login con auth por token (WordPress)
- Listado de clientes con filtros por estado
- Ficha de cliente con notas y timeline
- CRUD de clientes

### Fase 2 — Finanzas
- Cotizaciones asociadas a clientes
- Registro de pagos (pagado / pendiente)
- Resumen financiero por cliente

### Fase 3 — Dashboard
- Métricas generales
- Alertas de plazos próximos
- Exportar a CSV