'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { IDIOMAS, TEXTOS, type Idioma } from '@/lib/documentos/idioma'

interface BarraDocumentoProps {
  idioma: Idioma
  volverHref?: string
  children?: ReactNode
}

// Barra de pantalla: no sale en el PDF
export const BarraDocumento = ({ idioma, volverHref, children }: BarraDocumentoProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hrefIdioma = (otro: Idioma) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('idioma', otro)
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="mx-auto mb-4 flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 sm:px-0 print:hidden">
      <div className="flex items-center gap-3">
        {volverHref && (
          <Link href={volverHref} className="text-xs text-dark-text/50 transition-colors hover:text-dark-text">
            ← {TEXTOS[idioma].volver}
          </Link>
        )}
        <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white text-xs font-medium">
          {IDIOMAS.map((opcion) => (
            <Link
              key={opcion}
              href={hrefIdioma(opcion)}
              replace
              aria-current={opcion === idioma ? 'true' : undefined}
              className={`px-3 py-1.5 uppercase transition-colors ${
                opcion === idioma ? 'bg-brand-blue text-white' : 'text-dark-text/60 hover:bg-slate-50'
              }`}
            >
              {opcion}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white transition hover:brightness-95"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
          </svg>
          {TEXTOS[idioma].descargarPdf}
        </button>
      </div>
    </div>
  )
}
