import Link from 'next/link'
import type { ReactNode } from 'react'

interface PaginaFormularioProps {
  titulo: string
  volverHref: string
  volverLabel: string
  children: ReactNode
}

export const PaginaFormulario = ({ titulo, volverHref, volverLabel, children }: PaginaFormularioProps) => (
  <div className="max-w-xl px-4 py-8 sm:px-8">
    <div className="mb-7">
      <Link href={volverHref} className="text-xs text-dark-text/50 transition-colors hover:text-dark-text">
        ← {volverLabel}
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-dark-text">{titulo}</h1>
    </div>
    {children}
  </div>
)
