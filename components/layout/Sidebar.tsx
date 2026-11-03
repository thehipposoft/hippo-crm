'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAVEGACION } from '@/lib/navegacion'

const esActivo = (pathname: string, href: string): boolean =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

// Logo del manual de marca (proporción 1350 × 338)
const LOGO_ANCHO = 84
const LOGO_ALTO = 21

const Logo = ({ claro = false }: { claro?: boolean }) => (
  <div className="flex items-end gap-2">
    <Image src={claro ? '/hippo-logo-blanco.svg' : '/hippo-logo.svg'} alt="Hippo" width={LOGO_ANCHO} height={LOGO_ALTO} priority />
    <span className={`text-[11px] font-medium uppercase tracking-[0.2em] ${claro ? 'text-white/50' : 'text-dark-text/40'}`}>CRM</span>
  </div>
)

interface SidebarProps {
  userName: string
}

// Desktop: barra lateral fija. Mobile: barra superior + panel deslizable.
export const Sidebar = ({ userName }: SidebarProps) => {
  const pathname = usePathname()
  const [abierto, setAbierto] = useState(false)
  const cerrar = () => setAbierto(false)

  useEffect(() => {
    if (!abierto) return
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('keydown', alTeclado)
    return () => document.removeEventListener('keydown', alTeclado)
  }, [abierto])

  return (
    <>
      {/* Barra superior (mobile) */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          aria-controls="sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-md text-dark-text/60 transition-colors hover:bg-slate-100 hover:text-dark-text"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Fondo oscuro (mobile, con el panel abierto) */}
      {abierto && (
        <div onClick={cerrar} aria-hidden className="fixed inset-0 z-30 bg-dark-text/30 md:hidden" />
      )}

      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-dark-text transition-transform md:static md:w-56 md:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Logo claro />
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar menú"
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/10 md:hidden"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAVEGACION.map(({ label, href, icono }) => {
            const activo = esActivo(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                onClick={cerrar}
                aria-current={activo ? 'page' : undefined}
                className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  activo ? 'bg-white/10 font-medium text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <svg
                  className={`h-4 w-4 shrink-0 ${activo ? 'text-brand-blue' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icono} />
                </svg>
                {label}
                {/* El punto cuadrado de la marca marca la sección activa */}
                {activo && <span className="absolute right-3 h-1.5 w-1.5 bg-brand-blue" aria-hidden />}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/10 px-3 pb-4 pt-3">
          <div className="mb-1 flex items-center gap-2.5 px-3 py-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-lavender">
              <span className="text-xs font-medium text-dark-text">{userName[0]?.toUpperCase() ?? 'U'}</span>
            </div>
            <p className="truncate text-xs text-white/60">{userName}</p>
          </div>

          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
