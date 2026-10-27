import Link from 'next/link'
import type { ReactNode } from 'react'
import { formatDiasRelativos, formatFechaCorta, formatMonto } from '@/lib/format'
import type { FechaCalendario } from '@/lib/fechas'
import type { Moneda } from '@/lib/types'

const DIAS_URGENTE = 3

interface SeccionProps {
  titulo: string
  descripcion?: string
  cantidad?: number
  verTodoHref?: string
  vacio: string
  children?: ReactNode
}

// Tarjeta de sección del dashboard; sin children muestra el estado vacío
export const Seccion = ({ titulo, descripcion, cantidad, verTodoHref, vacio, children }: SeccionProps) => (
  <section className="rounded-xl border border-slate-200 bg-white">
    <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-dark-text">
          {titulo}
          {cantidad !== undefined && cantidad > 0 && (
            <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-medium text-cyan-700">{cantidad}</span>
          )}
        </h2>
        {descripcion && <p className="mt-0.5 text-xs text-dark-text/50">{descripcion}</p>}
      </div>
      {verTodoHref && (
        <Link href={verTodoHref} className="shrink-0 text-xs font-medium text-brand-blue hover:brightness-90">
          Ver todo
        </Link>
      )}
    </header>
    {children ?? <p className="px-5 py-8 text-center text-sm text-dark-text/40">{vacio}</p>}
  </section>
)

export const ListaSeccion = ({ children }: { children: ReactNode }) => (
  <ul className="divide-y divide-slate-100">{children}</ul>
)

interface FilaListaProps {
  href: string
  titulo: string
  detalle?: ReactNode
  lateral?: ReactNode
}

export const FilaLista = ({ href, titulo, detalle, lateral }: FilaListaProps) => (
  <li>
    <Link href={href} className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-brand-white">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-dark-text">{titulo}</p>
        {detalle && <div className="mt-0.5 text-xs text-dark-text/50">{detalle}</div>}
      </div>
      {lateral && <div className="shrink-0 text-right">{lateral}</div>}
    </Link>
  </li>
)

// Fecha + "en 3 días" / "hace 2 días", en rojo si pasó y naranja si es inminente
export const FechaRelativa = ({ fecha, dias }: { fecha: FechaCalendario; dias: number }) => {
  const color = dias < 0 ? 'text-rose-600' : dias <= DIAS_URGENTE ? 'text-orange-600' : 'text-dark-text/50'
  return (
    <div className="text-xs">
      <p className="font-medium text-dark-text/80 tabular-nums">{formatFechaCorta(fecha)}</p>
      <p className={color}>{dias < 0 ? `vencido ${formatDiasRelativos(dias)}` : formatDiasRelativos(dias)}</p>
    </div>
  )
}

interface TarjetaMontosProps {
  titulo: string
  montos: Partial<Record<Moneda, number>>
  vacio: string
  ayuda?: string
}

// KPI con un renglón por moneda (nunca se suman monedas distintas)
export const TarjetaMontos = ({ titulo, montos, vacio, ayuda }: TarjetaMontosProps) => {
  const lineas = (Object.entries(montos) as [Moneda, number][]).filter(([, monto]) => monto !== 0)
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-xs font-medium uppercase tracking-wider text-dark-text/50">{titulo}</h3>
      <div className="mt-3 space-y-0.5">
        {lineas.length === 0 ? (
          <p className="text-sm text-dark-text/40">{vacio}</p>
        ) : (
          lineas.map(([moneda, monto]) => (
            <p key={moneda} className="text-xl font-semibold text-dark-text tabular-nums">
              {formatMonto(monto, moneda)}
            </p>
          ))
        )}
      </div>
      {ayuda && <p className="mt-2 text-xs text-dark-text/40">{ayuda}</p>}
    </div>
  )
}
