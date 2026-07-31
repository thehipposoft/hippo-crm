import { redirect } from 'next/navigation'

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
