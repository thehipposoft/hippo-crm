import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'

const TOKEN_COOKIE = 'hippo_token'
const USER_NAME_COOKIE = 'hippo_user_name'

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_COOKIE)?.value
  const userName = cookieStore.get(USER_NAME_COOKIE)?.value ?? 'Usuario'

  if (!token) redirect('/login')

  return (
    <div className="flex h-screen bg-brand-white text-dark-text">
      <aside className="flex flex-col w-56 shrink-0 border-r border-slate-200 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-[18px] border-b border-slate-200">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0">
            <Image src="/hippo-icon.png" alt="Hippo CRM" width={35} height={35} className="rounded-lg" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-dark-text">
            Hippo CRM
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-dark-text/60 hover:bg-brand-blue/10 hover:text-dark-text transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>

          <Link
            href="/proyectos"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-dark-text/60 hover:bg-brand-blue/10 hover:text-dark-text transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Proyectos
          </Link>

          <Link
            href="/pagos"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-dark-text/60 hover:bg-brand-blue/10 hover:text-dark-text transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m0-12a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
            Pagos
          </Link>

          <Link
            href="/clientes"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-dark-text/60 hover:bg-brand-blue/10 hover:text-dark-text transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Clientes
          </Link>
        </nav>

        {/* User + Sign out */}
        <div className="px-3 pb-4 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-dark-text/10 shrink-0">
              <span className="text-xs font-medium text-dark-text">
                {userName[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <p className="text-xs text-dark-text/50 truncate">{userName}</p>
          </div>

          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-dark-text/50 hover:bg-slate-100 hover:text-dark-text transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
