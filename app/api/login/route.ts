import { NextResponse } from 'next/server'
import { wpFetch } from '@/lib/wp'

const TOKEN_COOKIE = 'hippo_token'
const USER_NAME_COOKIE = 'hippo_user_name'
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

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
