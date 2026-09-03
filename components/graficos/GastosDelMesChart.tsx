'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MONEDAS, type Moneda } from '@/lib/types'
import { COLOR_MONEDA } from './colors'

const AXIS_TICK = { fill: '#283750', fontSize: 12, opacity: 0.6 }
const GRID_STROKE = '#e2e8f0'
const GASTOS_PARA_HORIZONTAL = 5
const ALTO_MINIMO = 220
const ALTO_POR_GASTO = 32

interface GastosDelMesChartProps {
  data: Array<{ nombre: string } & Record<Moneda, number>>
}

export const GastosDelMesChart = ({ data }: GastosDelMesChartProps) => {
  const monedasPresentes = MONEDAS.filter((m) => data.some((row) => row[m] !== 0))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-dark-text">Gastos del mes</h3>
      {monedasPresentes.length === 0 ? (
        <p className="text-sm text-dark-text/40">Todavía no hay costos registrados.</p>
      ) : (
        <div className="space-y-6">
          {monedasPresentes.map((moneda) => {
            const filas = data.filter((row) => row[moneda] !== 0).sort((a, b) => b[moneda] - a[moneda])
            const horizontal = filas.length > GASTOS_PARA_HORIZONTAL
            const alto = horizontal ? Math.max(ALTO_MINIMO, filas.length * ALTO_POR_GASTO) : ALTO_MINIMO

            return (
              <div key={moneda}>
                <p className="mb-2 text-xs font-medium text-dark-text/50 uppercase tracking-wider">{moneda}</p>
                <ResponsiveContainer width="100%" height={alto}>
                  <BarChart
                    data={filas}
                    layout={horizontal ? 'vertical' : 'horizontal'}
                    margin={{ top: 4, right: 16, left: horizontal ? 16 : 0, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GRID_STROKE}
                      horizontal={!horizontal}
                      vertical={horizontal}
                    />
                    {horizontal ? (
                      <>
                        <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
                        <YAxis
                          type="category"
                          dataKey="nombre"
                          tick={AXIS_TICK}
                          tickLine={false}
                          axisLine={false}
                          width={140}
                        />
                      </>
                    ) : (
                      <>
                        <XAxis dataKey="nombre" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
                        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
                      </>
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey={moneda}
                      name={moneda}
                      fill={COLOR_MONEDA[moneda]}
                      radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
