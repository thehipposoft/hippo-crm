import Image from 'next/image'
import type { ReactNode } from 'react'
import { EMPRESA } from '@/lib/empresa'
import { TEXTOS, type Idioma } from '@/lib/documentos/idioma'

interface HojaDocumentoProps {
  idioma: Idioma
  titulo: string
  // Número, fecha, etc. debajo del título
  datos: ReactNode
  pie?: ReactNode
  children: ReactNode
}

// Hoja A4: en pantalla con sombra, impresa ocupa la página
export const HojaDocumento = ({ idioma, titulo, datos, pie, children }: HojaDocumentoProps) => {
  const t = TEXTOS[idioma]
  return (
    <article className="mx-auto w-full max-w-[210mm] bg-white px-6 py-8 text-sm text-dark-text shadow-sm sm:px-12 sm:py-12 print:max-w-none print:p-0 print:shadow-none">
      <header className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Image src={EMPRESA.logo} alt={EMPRESA.nombre} width={EMPRESA.logoAncho} height={EMPRESA.logoAlto} priority />
          <div className="text-xs leading-relaxed text-dark-text/60">
            <p className="font-medium text-dark-text">{EMPRESA.nombre}</p>
            <p>{EMPRESA.web}</p>
            <p>{EMPRESA.email}</p>
            {EMPRESA.identificacionFiscal && (
              <p>
                {t.identificacion}: {EMPRESA.identificacionFiscal}
              </p>
            )}
          </div>
        </div>
        <div className="sm:text-right">
          <h1 className="text-2xl font-semibold uppercase tracking-wide text-dark-text">{titulo}</h1>
          <div className="mt-2 space-y-0.5 text-xs text-dark-text/60">{datos}</div>
        </div>
      </header>

      <div className="py-8">{children}</div>

      <footer className="border-t border-slate-200 pt-4 text-xs text-dark-text/50">
        {pie}
        <p className="mt-1">
          {t.consultas}: {EMPRESA.email} · {EMPRESA.web}
        </p>
      </footer>
    </article>
  )
}

export const Etiqueta = ({ children }: { children: ReactNode }) => (
  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-dark-text/50">{children}</p>
)
