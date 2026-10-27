'use client'

import Link from 'next/link'
import type { PagoRow } from '@/lib/types'
import { PagoRowActions } from './PagoRowActions'
import { SearchInput } from '@/components/ui/SearchInput'
import { ContenedorTabla, FilaTabla } from '@/components/ui/FilaTabla'
import { Th, ThOrdenable, useOrdenTabla } from '@/components/ui/Orden'
import { descargarArchivo, useParamsUrl } from '@/components/ui/useParamsUrl'
import { aCsv, type ColumnaCsv } from '@/lib/csv'
import { aIso, hoy } from '@/lib/fechas'
import { formatFecha, formatMonto } from '@/lib/format'
import { claveFecha, type ColumnaOrden } from '@/lib/orden'
import { enRango, esPeriodo, PERIODOS, rangoDePeriodo, type Periodo } from '@/lib/periodos'

const LARGO_NOTAS = 60

const truncate = (text: string, max: number): string =>
  text.length > max ? text.slice(0, max) + '…' : text

const coincide = (pago: PagoRow, query: string): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [pago.proyectoNombre, pago.clienteNombre, pago.medioPago, pago.notas]
    .filter((campo): campo is string => Boolean(campo))
    .some((campo) => campo.toLowerCase().includes(q))
}

const COLUMNAS = {
  proyecto: { valor: (p) => p.proyectoNombre, direccionInicial: 'asc' },
  cliente: { valor: (p) => p.clienteNombre, direccionInicial: 'asc' },
  // Mismo día: el cargado último primero
  fecha: { valor: (p) => [claveFecha(p.fecha), p.id], direccionInicial: 'desc' },
  monto: { valor: (p) => [p.moneda, p.monto], direccionInicial: 'desc' },
  medio: { valor: (p) => p.medioPago, direccionInicial: 'asc' },
} satisfies Record<string, ColumnaOrden<PagoRow>>

const COLUMNAS_CSV: ColumnaCsv<PagoRow>[] = [
  { titulo: 'Fecha', valor: (p) => claveFecha(p.fecha) },
  { titulo: 'Proyecto', valor: (p) => p.proyectoNombre },
  { titulo: 'Cliente', valor: (p) => p.clienteNombre },
  { titulo: 'Monto', valor: (p) => p.monto },
  { titulo: 'Moneda', valor: (p) => p.moneda },
  { titulo: 'Medio de pago', valor: (p) => p.medioPago },
  { titulo: 'Notas', valor: (p) => p.notas },
]

const CLASES_FECHA =
  'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-dark-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue'

interface PagosTableProps {
  pagos: PagoRow[]
  mostrarProyecto?: boolean
  // Selector de período (en la ficha de un proyecto no hace falta)
  conPeriodo?: boolean
}

export const PagosTable = ({ pagos, mostrarProyecto = true, conPeriodo = true }: PagosTableProps) => {
  const params = useParamsUrl()
  const { orden, cambiarOrden, ordenar } = useOrdenTabla(COLUMNAS, { columna: 'fecha', direccion: 'desc' })

  const busqueda = params.get('q') ?? ''
  const pedido = params.get('periodo')
  const periodo: Periodo = conPeriodo && esPeriodo(pedido) ? pedido : 'TODO'
  const manual = { desde: params.get('desde'), hasta: params.get('hasta') }
  const rango = rangoDePeriodo(periodo, manual)

  const filtrados = ordenar(pagos.filter((p) => coincide(p, busqueda) && enRango(p.fecha, rango)))

  const totalesPorMoneda = filtrados.reduce<Record<string, number>>((acc, p) => {
    acc[p.moneda] = (acc[p.moneda] ?? 0) + p.monto
    return acc
  }, {})
  const columnCount = (mostrarProyecto ? 6 : 5) + 1
  const thProps = { orden, onOrdenar: cambiarOrden }

  const exportar = () => {
    const sufijo = periodo === 'TODO' ? 'todos' : `${rango.desde ?? 'inicio'}_${rango.hasta ?? aIso(hoy())}`
    descargarArchivo(`pagos_${sufijo}.csv`, aCsv(filtrados, COLUMNAS_CSV), 'text/csv;charset=utf-8')
  }

  return (
    <div>
      {conPeriodo && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {PERIODOS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => params.set({ periodo: value === 'TODO' ? null : value })}
              aria-pressed={periodo === value}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                periodo === value
                  ? 'bg-brand-blue text-white'
                  : 'border border-slate-200 bg-white text-dark-text/60 hover:bg-brand-blue/10 hover:text-dark-text'
              }`}
            >
              {label}
            </button>
          ))}
          {periodo === 'RANGO' && (
            <div className="flex items-center gap-2 text-xs text-dark-text/60">
              <input
                type="date"
                aria-label="Desde"
                value={manual.desde ?? ''}
                onChange={(e) => params.set({ desde: e.target.value })}
                className={CLASES_FECHA}
              />
              a
              <input
                type="date"
                aria-label="Hasta"
                value={manual.hasta ?? ''}
                onChange={(e) => params.set({ hasta: e.target.value })}
                className={CLASES_FECHA}
              />
            </div>
          )}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-dark-text/60">
          {filtrados.length} {filtrados.length === 1 ? 'pago' : 'pagos'} · Total:{' '}
          <span className="font-medium text-dark-text">
            {Object.keys(totalesPorMoneda).length === 0
              ? '—'
              : Object.entries(totalesPorMoneda)
                  .map(([moneda, monto]) => formatMonto(monto, moneda))
                  .join(' + ')}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={busqueda}
            onChange={(valor) => params.set({ q: valor })}
            placeholder="Buscar por proyecto, cliente, notas..."
          />
          <button
            type="button"
            onClick={exportar}
            disabled={filtrados.length === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-dark-text transition-colors hover:bg-brand-blue/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            CSV
          </button>
        </div>
      </div>

      <ContenedorTabla>
        <table className="w-full min-w-3xl text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-brand-white">
              {mostrarProyecto && <ThOrdenable id="proyecto" {...thProps}>Proyecto</ThOrdenable>}
              <ThOrdenable id="cliente" {...thProps}>Cliente</ThOrdenable>
              <ThOrdenable id="fecha" {...thProps}>Fecha</ThOrdenable>
              <ThOrdenable id="monto" {...thProps}>Monto</ThOrdenable>
              <ThOrdenable id="medio" {...thProps}>Medio de pago</ThOrdenable>
              <Th>Notas</Th>
              <th className="w-12 px-3 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-5 py-14 text-center text-sm text-dark-text/40">
                  {pagos.length === 0 ? 'No hay pagos registrados todavía.' : 'No hay pagos con estos filtros.'}
                </td>
              </tr>
            ) : (
              filtrados.map((pago) => (
                <FilaTabla key={pago.id} href={`/pagos/${pago.id}`}>
                  {mostrarProyecto && (
                    <td className="px-5 py-4">
                      <span className="font-medium text-dark-text">{pago.proyectoNombre ?? '—'}</span>
                    </td>
                  )}
                  <td className="px-5 py-4 text-dark-text/60">{pago.clienteNombre ?? '—'}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-dark-text/60 tabular-nums">{formatFecha(pago.fecha)}</td>
                  <td className="whitespace-nowrap px-5 py-4 tabular-nums">
                    <Link href={`/pagos/${pago.id}`} className="font-medium text-dark-text hover:text-brand-blue">
                      {formatMonto(pago.monto, pago.moneda)}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-dark-text/60">{pago.medioPago ?? '—'}</td>
                  <td className="max-w-xs px-5 py-4 text-dark-text/60">
                    {pago.notas ? truncate(pago.notas, LARGO_NOTAS) : '—'}
                  </td>
                  <td className="px-3 py-4" data-sin-navegar>
                    <PagoRowActions pagoId={pago.id} />
                  </td>
                </FilaTabla>
              ))
            )}
          </tbody>
        </table>
      </ContenedorTabla>
    </div>
  )
}
