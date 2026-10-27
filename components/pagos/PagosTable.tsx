'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PagoRow } from '@/lib/types'
import { PagoRowActions } from './PagoRowActions'
import { SearchInput } from '@/components/ui/SearchInput'
import { ContenedorTabla, FilaTabla } from '@/components/ui/FilaTabla'
import { formatFecha, formatMonto } from '@/lib/format'

const truncate = (text: string, max: number): string =>
  text.length > max ? text.slice(0, max) + '…' : text

const coincide = (pago: PagoRow, query: string): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [pago.proyectoNombre, pago.clienteNombre, pago.medioPago, pago.notas]
    .filter((campo): campo is string => Boolean(campo))
    .some((campo) => campo.toLowerCase().includes(q))
}

interface PagosTableProps {
  pagos: PagoRow[]
  mostrarProyecto?: boolean
}

export const PagosTable = ({ pagos, mostrarProyecto = true }: PagosTableProps) => {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = pagos.filter((p) => coincide(p, busqueda))

  const totalesPorMoneda = filtrados.reduce<Record<string, number>>((acc, p) => {
    acc[p.moneda] = (acc[p.moneda] ?? 0) + p.monto
    return acc
  }, {})
  const columnCount = (mostrarProyecto ? 6 : 5) + 1

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-dark-text/60">
          Total:{' '}
          <span className="font-medium text-dark-text">
            {Object.keys(totalesPorMoneda).length === 0
              ? '—'
              : Object.entries(totalesPorMoneda)
                  .map(([moneda, monto]) => formatMonto(monto, moneda))
                  .join(' + ')}
          </span>
        </p>
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por proyecto, cliente, notas..." />
      </div>

      <ContenedorTabla>
        <table className="w-full min-w-3xl text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-brand-white">
              {mostrarProyecto && (
                <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                  Proyecto
                </th>
              )}
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Medio de pago
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Notas
              </th>
              <th className="px-3 py-3.5 w-12" />
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-5 py-14 text-center text-sm text-dark-text/40"
                >
                  {pagos.length === 0 ? 'No hay pagos registrados todavía.' : 'No se encontraron pagos.'}
                </td>
              </tr>
            ) : (
              filtrados.map((pago) => (
                <FilaTabla key={pago.id} href={`/pagos/${pago.id}`}>
                  {mostrarProyecto && (
                    <td className="px-5 py-4">
                      <span className="font-medium text-dark-text">
                        {pago.proyectoNombre ?? '—'}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-4 text-dark-text/60">
                    {pago.clienteNombre ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-dark-text/60 tabular-nums">
                    {formatFecha(pago.fecha)}
                  </td>
                  <td className="px-5 py-4 tabular-nums">
                    <Link href={`/pagos/${pago.id}`} className="font-medium text-dark-text hover:text-brand-blue">
                      {formatMonto(pago.monto, pago.moneda)}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-dark-text/60">
                    {pago.medioPago ?? '—'}
                  </td>
                  <td className="px-5 py-4 max-w-xs text-dark-text/60">
                    {pago.notas ? truncate(pago.notas, 60) : '—'}
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
