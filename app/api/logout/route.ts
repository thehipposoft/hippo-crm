import { NextResponse } from 'next/server'
import { TOKEN_COOKIE, USER_NAME_COOKIE } from '@/lib/cookies'

export const POST = async (request: Request) => {
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.delete(TOKEN_COOKIE)
  response.cookies.delete(USER_NAME_COOKIE)
  return response
}
