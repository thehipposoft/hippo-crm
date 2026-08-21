'use client'

import type { ReactNode } from 'react'
import { costosEsteMes, pagosEsteMes, resultadoParcial } from '@/lib/analytics'
import type { CostoRow, Moneda, PagoRow } from '@/lib/types'

const formatMonto = (monto: number, moneda: Moneda): string =>
  new Intl.NumberFormat('es-UY', { style: 'currency', currency: moneda }).format(monto)

interface PerformanceCardsProps {
  pagos: PagoRow[]
  costos: CostoRow[]
}

export const PerformanceCards = ({ pagos, costos }: PerformanceCardsProps) => {
  const lineasPagos = Object.entries(pagosEsteMes(pagos)).filter(([, monto]) => monto !== 0) as [Moneda, number][]
  const lineasCostos = Object.entries(costosEsteMes(costos)).filter(([, monto]) => monto !== 0) as [Moneda, number][]
  const lineasResultado = Object.entries(resultadoParcial(pagos, costos)) as [Moneda, number][]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card titulo="Pagos recibidos este mes">
        {lineasPagos.length === 0 ? (
          <EmptyLine />
        ) : (
          lineasPagos.map(([moneda, monto]) => (
            <p key={moneda} className="text-sm text-dark-text">
              {formatMonto(monto, moneda)}
            </p>
          ))
        )}
      </Card>

      <Card titulo="Costos del mes">
        {lineasCostos.length === 0 ? (
          <EmptyLine />
        ) : (
          lineasCostos.map(([moneda, monto]) => (
            <p key={moneda} className="text-sm text-dark-text">
              {formatMonto(monto, moneda)}
            </p>
          ))
        )}
      </Card>

      <Card titulo="Resultado parcial">
        {lineasResultado.length === 0 ? (
          <EmptyLine />
        ) : (
          lineasResultado.map(([moneda, monto]) => (
            <p
              key={moneda}
              className={`text-sm font-medium ${monto >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {formatMonto(monto, moneda)}
            </p>
          ))
        )}
      </Card>
    </div>
  )
}

const Card = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <h3 className="mb-3 text-xs font-medium text-dark-text/50 uppercase tracking-wider">{titulo}</h3>
    <div className="space-y-1">{children}</div>
  </div>
)

const EmptyLine = () => <p className="text-sm text-dark-text/40">Sin movimientos</p>
