# Hippo CRM

CRM interno de The Hipposoft: clientes, proyectos, pagos, costos y un tablero de
gráficos financieros. Next.js 16 sobre la API REST de WordPress (`wp.thehipposoft.com`).

## Correr en local

1. Instalar dependencias:
   ```bash
   yarn
   ```
2. Crear `.env.local` en la raíz:
   ```
   WP_API_URL=https://wp.thehipposoft.com/wp-json/hippo/v1
   ```
3. Levantar el servidor y abrir http://localhost:3000:
   ```bash
   yarn dev
   ```
4. Entrar con tu usuario de WordPress y una **Application Password**
   (wp-admin → Usuarios → Perfil → Contraseñas de aplicación), no con tu
   contraseña normal.

> En local se trabaja contra los datos reales de producción: lo que crees,
> edites o borres cambia los datos de verdad.

## Comandos

| Comando          | Qué hace                        |
|------------------|---------------------------------|
| `yarn dev`       | Servidor de desarrollo          |
| `yarn build`     | Build de producción             |
| `yarn lint`      | ESLint                          |
| `yarn typecheck` | Chequeo de tipos (tsc --noEmit) |

## Deploy

Hosting en Netlify (`crm.thehipposoft.com`). La variable `WP_API_URL` tiene que
estar configurada en el sitio de Netlify.

El backend (endpoints `hippo/v1`) vive en el `functions.php` del theme de
WordPress, sección "HIPPO CRM IMPLEMENTACIÓN", y se despliega aparte.

## Documentación

- `CLAUDE.md` — contexto, modelo de datos y reglas de negocio
- `AGENTS.md` — estructura del proyecto y convenciones de código
