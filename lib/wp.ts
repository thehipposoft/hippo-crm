import { notFound, redirect, unstable_rethrow } from 'next/navigation'
import { getToken } from './auth'

export const wpFetch = async <T>(
  path: string,
  token?: string,
  options?: RequestInit
): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  }

  const res = await fetch(`${process.env.WP_API_URL}${path}`, {
    ...options,
    headers,
  })

  // Un 401 sin token es login con credenciales inválidas, no una sesión vencida.
  if (res.status === 401 && token) {
    redirect('/login')
  }

  if (!res.ok) {
    throw new Error(`WP API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// GET autenticado con el token de la sesión
export const wpGet = async <T>(path: string): Promise<T> => wpFetch<T>(path, await getToken())

// Igual que wpGet, pero un error muestra la página 404 (fichas y edición)
export const wpGetONotFound = async <T>(path: string): Promise<T> => {
  try {
    return await wpGet<T>(path)
  } catch (error) {
    unstable_rethrow(error)
    notFound()
  }
}

// Para datos secundarios (ej. tareas en el dashboard): si falla, se muestra la página igual
export const wpGetOpcional = async <T>(path: string, porDefecto: T): Promise<T> => {
  try {
    return await wpGet<T>(path)
  } catch (error) {
    unstable_rethrow(error)
    return porDefecto
  }
}

// Login: sin token y sin tirar error, para poder leer el motivo que devuelve WordPress
export type RespuestaLogin =
  | { ok: true; token: string; user: { name: string } }
  | { ok: false; status: number | null; codigo: string | null }

export const wpLogin = async (username: string, password: string): Promise<RespuestaLogin> => {
  try {
    const res = await fetch(`${process.env.WP_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    })
    const datos = (await res.json().catch(() => null)) as { token?: string; user?: { name: string }; codigo?: string } | null
    if (res.ok && datos?.token && datos.user) return { ok: true, token: datos.token, user: datos.user }
    return { ok: false, status: res.status, codigo: datos?.codigo ?? null }
  } catch {
    return { ok: false, status: null, codigo: null }
  }
}

// Endpoints públicos y del portal: devuelven status y datos sin tirar error,
// para poder mostrar el motivo (credenciales, link vencido, etc.)
export const wpPublico = async <T>(
  path: string,
  init: { method?: 'GET' | 'POST'; body?: unknown; token?: string } = {}
): Promise<{ status: number | null; datos: T | null }> => {
  try {
    const res = await fetch(`${process.env.WP_API_URL}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
    })
    return { status: res.status, datos: (await res.json().catch(() => null)) as T | null }
  } catch {
    return { status: null, datos: null }
  }
}
