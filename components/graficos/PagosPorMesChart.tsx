'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MONEDAS, type Moneda } from '@/lib/types'
import { COLOR_MONEDA } from './colors'

const AXIS_TICK = { fill: '#283750', fontSize: 12, opacity: 0.6 }
const GRID_STROKE = '#e2e8f0'
const ALTO_CHART = 220

interface PagosPorMesChartProps {
  data: Array<{ mes: string } & Record<Moneda, number>>
}

export const PagosPorMesChart = ({ data }: PagosPorMesChartProps) => {
  const monedasPresentes = MONEDAS.filter((m) => data.some((row) => row[m] !== 0))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-dark-text">Pagos por mes</h3>
      {monedasPresentes.length === 0 ? (
        <p className="text-sm text-dark-text/40">Todavía no hay pagos registrados.</p>
      ) : (
        <div className="space-y-6">
          {monedasPresentes.map((moneda) => (
            <div key={moneda}>
              <p className="mb-2 text-xs font-medium text-dark-text/50 uppercase tracking-wider">{moneda}</p>
              <ResponsiveContainer width="100%" height={ALTO_CHART}>
                <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                  <XAxis dataKey="mes" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
                  <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey={moneda} name={moneda} fill={COLOR_MONEDA[moneda]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
