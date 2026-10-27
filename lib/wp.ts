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
