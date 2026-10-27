import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getNombreUsuario, getToken } from '@/lib/auth'
import { NAVEGACION } from '@/lib/navegacion'

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = await getToken()
  const userName = await getNombreUsuario()

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
          {NAVEGACION.map(({ label, href, icono }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-dark-text/60 hover:bg-brand-blue/10 hover:text-dark-text transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icono} />
              </svg>
              {label}
            </Link>
          ))}
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
