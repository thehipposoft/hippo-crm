'use client'

import type { MouseEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface FilaTablaProps {
  href: string
  className?: string
  children: ReactNode
}

// Fila clickeable. La navegación "real" (teclado, cmd/ctrl+click, abrir en otra
// pestaña) la da el <Link> de la primera celda; el click en el resto de la fila
// es un atajo. No navega si el click fue en un link, botón o celda marcada.
export const FilaTabla = ({ href, className = '', children }: FilaTablaProps) => {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLTableRowElement>) => {
    if ((e.target as Element).closest('a, button, input, select, dialog, [data-sin-navegar]')) return
    router.push(href)
  }

  return (
    <tr
      onClick={handleClick}
      className={`cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-brand-white ${className}`}
    >
      {children}
    </tr>
  )
}

// Contenedor de tabla con scroll horizontal en pantallas chicas
export const ContenedorTabla = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">{children}</div>
)
