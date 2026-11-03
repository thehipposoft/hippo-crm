import type { EstadoPublico, PropuestaPublica } from './types'
import { wpFetch } from './wp'

// 32 bytes en hex, como los genera WordPress
const PATRON_TOKEN = /^[a-f0-9]{64}$/

// Estado de cuenta del link público. null si el token no es válido o fue desactivado.
export const obtenerEstadoPublico = async (token: string): Promise<EstadoPublico | null> => {
  if (!PATRON_TOKEN.test(token)) return null
  try {
    return await wpFetch<EstadoPublico>(`/publico/estado-de-cuenta/${token}`)
  } catch {
    return null
  }
}

// Propuesta del link público. `marcarVista: false` cuando la abre alguien del equipo (no cuenta como vista).
export const obtenerPropuestaPublica = async (token: string, marcarVista: boolean): Promise<PropuestaPublica | null> => {
  if (!PATRON_TOKEN.test(token)) return null
  try {
    return await wpFetch<PropuestaPublica>(`/publico/propuesta/${token}${marcarVista ? '' : '?vista=0'}`, undefined, { cache: 'no-store' })
  } catch {
    return null
  }
}

export type ErrorRespuesta = 'YA_RESPONDIDA' | 'VENCIDA' | 'ERROR'

const STATUS_YA_RESPONDIDA = 409
const STATUS_VENCIDA = 410

// Aceptar / rechazar desde el link público (sin login)
export const enviarRespuestaPropuesta = async (
  token: string,
  datos: { accion: 'ACEPTAR' | 'RECHAZAR'; nombre: string; comentario: string }
): Promise<ErrorRespuesta | null> => {
  if (!PATRON_TOKEN.test(token)) return 'ERROR'
  try {
    await wpFetch(`/publico/propuesta/${token}/respuesta`, undefined, { method: 'POST', body: JSON.stringify(datos) })
    return null
  } catch (error) {
    const status = Number(/WP API error: (\d+)/.exec(String(error))?.[1])
    if (status === STATUS_YA_RESPONDIDA) return 'YA_RESPONDIDA'
    if (status === STATUS_VENCIDA) return 'VENCIDA'
    return 'ERROR'
  }
}
