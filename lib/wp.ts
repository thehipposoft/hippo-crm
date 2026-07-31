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

  if (!res.ok) {
    throw new Error(`WP API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}
