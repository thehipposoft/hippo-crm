// Sin imports: lo usa también el middleware (edge)
export const TOKEN_COOKIE = 'hippo_token'
export const USER_NAME_COOKIE = 'hippo_user_name'
export const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

// Portal de clientes: sesión propia, separada de la del equipo
export const PORTAL_COOKIE = 'hippo_portal'
export const PORTAL_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
