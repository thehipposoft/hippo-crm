import { cookies } from 'next/headers'
import { TOKEN_COOKIE, USER_NAME_COOKIE } from './cookies'

export const getToken = async (): Promise<string | undefined> =>
  (await cookies()).get(TOKEN_COOKIE)?.value

// Primer nombre del display_name de WordPress
export const getNombreUsuario = async (): Promise<string> => {
  const nombre = (await cookies()).get(USER_NAME_COOKIE)?.value?.trim()
  return nombre?.split(/\s+/)[0] || 'Usuario'
}
