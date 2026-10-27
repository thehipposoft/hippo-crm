import type { EstadoPublico } from './types'
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
