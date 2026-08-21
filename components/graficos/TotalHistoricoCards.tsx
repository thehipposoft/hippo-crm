'use client'

import { totalHistoricoPagos } from '@/lib/analytics'
import type { Moneda, PagoRow } from '@/lib/types'

const formatMonto = (monto: number, moneda: Moneda): string =>
  new Intl.NumberFormat('es-UY', { style: 'currency', currency: moneda }).format(monto)

interface TotalHistoricoCardsProps {
  pagos: PagoRow[]
}

export const TotalHistoricoCards = ({ pagos }: TotalHistoricoCardsProps) => {
  const totales = Object.entries(totalHistoricoPagos(pagos)).filter(([, monto]) => monto !== 0) as [
    Moneda,
    number,
  ][]

  if (totales.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-dark-text/40">
        Todavía no hay pagos registrados.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {totales.map(([moneda, monto]) => (
        <div key={moneda} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-2 text-xs font-medium text-dark-text/50 uppercase tracking-wider">
            Total histórico · {moneda}
          </h3>
          <p className="text-xl font-semibold text-dark-text">{formatMonto(monto, moneda)}</p>
        </div>
      ))}
    </div>
  )
}
