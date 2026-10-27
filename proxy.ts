import { NextResponse, type NextRequest } from 'next/server'
import { TOKEN_COOKIE } from './lib/cookies'

const RUTAS_PUBLICAS = ['/estado/']

// Chequeo optimista de sesión: solo mira si existe la cookie. WordPress valida el token.
export const proxy = (request: NextRequest) => {
  // Links públicos del estado de cuenta: los ve el cliente, sin sesión
  if (RUTAS_PUBLICAS.some((ruta) => request.nextUrl.pathname.startsWith(ruta))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(TOKEN_COOKIE)
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  if (!token && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (token && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/proyectos'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

