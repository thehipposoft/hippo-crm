import { NextResponse, type NextRequest } from 'next/server'

const TOKEN_COOKIE = 'hippo_token'

export const middleware = (request: NextRequest) => {
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

