import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { Idioma } from '@/lib/documentos/idioma'
import { EMPRESA } from '@/lib/empresa'
import { TEXTOS_PORTAL } from '@/lib/portal/textos'

interface PantallaAccesoProps {
  idioma: Idioma
  titulo: string
  ayuda?: ReactNode
  // Selector de idioma (login y "olvidé"): link a la misma ruta con ?idioma=
  rutaIdioma?: string
  children: ReactNode
}

// Login, crear contraseña y recuperar: tarjeta centrada con la marca
export const PantallaAcceso = ({ idioma, titulo, ayuda, rutaIdioma, children }: PantallaAccesoProps) => (
  <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Image src={EMPRESA.logo} alt="Hippo" width={EMPRESA.logoAncho} height={EMPRESA.logoAlto} priority />
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-dark-text/40">{TEXTOS_PORTAL[idioma].portal}</span>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          {titulo}
          <span className="ml-1 inline-block h-[0.22em] w-[0.22em] bg-brand-blue" aria-hidden />
        </h1>
        {ayuda && <p className="mt-1.5 text-sm text-dark-text/60">{ayuda}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {rutaIdioma && (
        <p className="mt-6 text-center text-xs text-dark-text/50">
          <Link href={`${rutaIdioma}?idioma=es`} aria-current={idioma === 'es' ? 'true' : undefined} className={idioma === 'es' ? 'font-semibold text-dark-text' : 'hover:text-dark-text'}>
            Español
          </Link>
          {' · '}
          <Link href={`${rutaIdioma}?idioma=en`} aria-current={idioma === 'en' ? 'true' : undefined} className={idioma === 'en' ? 'font-semibold text-dark-text' : 'hover:text-dark-text'}>
            English
          </Link>
        </p>
      )}
    </div>
  </main>
)
