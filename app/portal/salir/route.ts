import { NextResponse, type NextRequest } from 'next/server'
import { PORTAL_COOKIE } from '@/lib/cookies'
import { wpPublico } from '@/lib/wp'

// Cierra la sesión del portal (también cuando venció) y vuelve al login
export const GET = async (request: NextRequest) => {
  const token = request.cookies.get(PORTAL_COOKIE)?.value
  if (token) await wpPublico('/portal/salir', { method: 'POST', token })
  const response = NextResponse.redirect(new URL('/portal', request.url))
  response.cookies.delete(PORTAL_COOKIE)
  return response
}
