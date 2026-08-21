'use client'

import { useRouter } from 'next/navigation'
import { FRECUENCIAS_PAGO, type CostoRow } from '@/lib/types'
import { CostoRowActions } from './CostoRowActions'

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatMonto = (monto: number, moneda: string): string =>
  new Intl.NumberFormat('es-UY', { style: 'currency', currency: moneda }).format(monto)

const labelFrecuencia = (frecuencia: CostoRow['frecuencia']): string =>
  FRECUENCIAS_PAGO.find((f) => f.value === frecuencia)?.label ?? frecuencia

interface CostosTableProps {
  costos: CostoRow[]
}

export const CostosTable = ({ costos }: CostosTableProps) => {
  const router = useRouter()

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-brand-white">
            <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
              Nombre del costo
            </th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
              Monto
            </th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
              Frecuencia
            </th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
              Método de pago
            </th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
              Fecha de renovación
            </th>
            <th className="px-3 py-3.5 w-12" />
          </tr>
        </thead>
        <tbody>
          {costos.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-14 text-center text-sm text-dark-text/40">
                No hay costos registrados todavía.
              </td>
            </tr>
          ) : (
            costos.map((costo) => (
              <tr
                key={costo.id}
                onClick={() => router.push(`/costos/${costo.id}`)}
                className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-brand-white transition-colors"
              >
                <td className="px-5 py-4">
                  <span className="font-medium text-dark-text">
                    {costo.nombreCosto}
                  </span>
                </td>
                <td className="px-5 py-4 text-dark-text tabular-nums">
                  {formatMonto(costo.monto, costo.moneda)}
                </td>
                <td className="px-5 py-4 text-dark-text/60">
                  {labelFrecuencia(costo.frecuencia)}
                </td>
                <td className="px-5 py-4 text-dark-text/60">
                  {costo.metodoPago ?? '—'}
                </td>
                <td className="px-5 py-4 text-dark-text/60 tabular-nums">
                  {formatDate(costo.fechaRenovacion)}
                </td>
                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                  <CostoRowActions costoId={costo.id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
