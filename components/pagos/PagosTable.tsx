'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PagoRow } from '@/lib/types'
import { PagoRowActions } from './PagoRowActions'
import { SearchInput } from '@/components/ui/SearchInput'

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatMonto = (monto: number, moneda: string | null | undefined): string =>
  new Intl.NumberFormat('es-UY', { style: 'currency', currency: moneda || 'USD' }).format(monto)

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
  const router = useRouter()
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

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
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
                <tr
                  key={pago.id}
                  onClick={() => router.push(`/pagos/${pago.id}`)}
                  className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-brand-white transition-colors"
                >
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
                    {formatDate(pago.fecha)}
                  </td>
                  <td className="px-5 py-4 text-dark-text tabular-nums">
                    {formatMonto(pago.monto, pago.moneda)}
                  </td>
                  <td className="px-5 py-4 text-dark-text/60">
                    {pago.medioPago ?? '—'}
                  </td>
                  <td className="px-5 py-4 max-w-xs text-dark-text/60">
                    {pago.notas ? truncate(pago.notas, 60) : '—'}
                  </td>
                  <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                    <PagoRowActions pagoId={pago.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
