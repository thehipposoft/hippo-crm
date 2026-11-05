import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PORTAL_COOKIE } from '@/lib/cookies'
import type { EstadoPortal } from '@/lib/types'
import { wpPublico } from '@/lib/wp'

const STATUS_SIN_SESION = [401, 403]

export const getPortalToken = async (): Promise<string | null> => (await cookies()).get(PORTAL_COOKIE)?.value ?? null

// Estado de cuenta del cliente logueado; sin sesión válida vuelve al login del portal
export const obtenerEstadoPortal = async (): Promise<EstadoPortal> => {
  const token = await getPortalToken()
  if (!token) redirect('/portal')
  const { status, datos } = await wpPublico<EstadoPortal>('/portal/estado', { token })
  if (status !== null && STATUS_SIN_SESION.includes(status)) redirect('/portal/salir')
  if (status !== 200 || !datos) throw new Error(`Portal: WordPress respondió ${status ?? 'sin conexión'}`)
  return datos
}
