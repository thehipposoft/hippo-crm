import { NextResponse } from 'next/server'
import { TOKEN_COOKIE, TOKEN_MAX_AGE_SECONDS, USER_NAME_COOKIE } from '@/lib/cookies'
import { wpFetch } from '@/lib/wp'

export const POST = async (request: Request) => {
  const { username, password } = await request.json()

  try {
    const { token, user } = await wpFetch<{ token: string; user: { name: string } }>(
      '/login',
      undefined,
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    )

    const response = NextResponse.json({ user })
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: TOKEN_MAX_AGE_SECONDS,
      path: '/',
    }
    response.cookies.set(TOKEN_COOKIE, token, cookieOptions)
    response.cookies.set(USER_NAME_COOKIE, user.name, cookieOptions)

    return response
  } catch {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 })
  }
}
