import { NextResponse } from 'next/server'
import { TOKEN_COOKIE, TOKEN_MAX_AGE_SECONDS, USER_NAME_COOKIE } from '@/lib/cookies'
import { wpLogin, type RespuestaLogin } from '@/lib/wp'

const STATUS_CREDENCIALES = [400, 401, 403]
const STATUS_NO_ENCONTRADO = 404

// Antes cualquier falla decía "contraseña incorrecta". Ahora se distingue para saber qué arreglar
// (el detalle queda en los logs de la función en Netlify).
const errorDeLogin = (r: Extract<RespuestaLogin, { ok: false }>): { mensaje: string; status: number } => {
  if (!process.env.WP_API_URL) return { mensaje: 'Falta configurar WP_API_URL en el servidor del CRM.', status: 500 }
  if (r.codigo === 'password_normal') {
    return {
      mensaje: 'Esa es tu contraseña normal de WordPress. El CRM usa una contraseña de aplicación (WordPress → Usuarios → Perfil → Contraseñas de aplicación).',
      status: 401,
    }
  }
  if (r.codigo === 'app_passwords_desactivadas') {
    return { mensaje: 'Las contraseñas de aplicación están desactivadas en WordPress (revisá plugins de seguridad).', status: 503 }
  }
  if (r.status !== null && STATUS_CREDENCIALES.includes(r.status)) {
    return { mensaje: 'Usuario o contraseña de aplicación incorrectos.', status: 401 }
  }
  if (r.status === STATUS_NO_ENCONTRADO) {
    return { mensaje: 'WordPress no tiene la ruta de login: revisá que el plugin Hippo CRM esté activo.', status: 502 }
  }
  if (r.status !== null) return { mensaje: `WordPress respondió con un error (${r.status}). Probá de nuevo en un rato.`, status: 502 }
  return { mensaje: 'No se pudo conectar con WordPress. Probá de nuevo en un rato.', status: 502 }
}

export const POST = async (request: Request) => {
  const { username, password } = (await request.json()) as { username?: string; password?: string }
  const resultado = await wpLogin(username?.trim() ?? '', password ?? '')

  if (!resultado.ok) {
    const { mensaje, status } = errorDeLogin(resultado)
    console.error('[login]', `status=${resultado.status ?? 'sin conexión'}`, `codigo=${resultado.codigo ?? '-'}`)
    return NextResponse.json({ error: mensaje }, { status })
  }

  const response = NextResponse.json({ user: resultado.user })
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: TOKEN_MAX_AGE_SECONDS,
    path: '/',
  }
  response.cookies.set(TOKEN_COOKIE, resultado.token, cookieOptions)
  response.cookies.set(USER_NAME_COOKIE, resultado.user.name, cookieOptions)
  return response
}
