'use client'

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MONEDAS, type Moneda } from '@/lib/types'
import { COLOR_MONEDA } from './colors'

const AXIS_TICK = { fill: '#283750', fontSize: 12, opacity: 0.6 }
const GRID_STROKE = '#e2e8f0'
const CLIENTES_PARA_HORIZONTAL = 5
const ALTO_MINIMO = 300
const ALTO_POR_CLIENTE = 36

interface PagosPorClienteChartProps {
  data: Array<{ cliente: string } & Record<Moneda, number>>
}

export const PagosPorClienteChart = ({ data }: PagosPorClienteChartProps) => {
  const monedasPresentes = MONEDAS.filter((m) => data.some((row) => row[m] !== 0))
  const horizontal = data.length > CLIENTES_PARA_HORIZONTAL
  const alto = horizontal ? Math.max(ALTO_MINIMO, data.length * ALTO_POR_CLIENTE) : ALTO_MINIMO

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-dark-text">Pagos por cliente</h3>
      {monedasPresentes.length === 0 ? (
        <p className="text-sm text-dark-text/40">Todavía no hay pagos registrados.</p>
      ) : (
        <ResponsiveContainer width="100%" height={alto}>
          <BarChart
            data={data}
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 4, right: 16, left: horizontal ? 16 : 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={!horizontal} vertical={horizontal} />
            {horizontal ? (
              <>
                <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
                <YAxis type="category" dataKey="cliente" tick={AXIS_TICK} tickLine={false} axisLine={false} width={120} />
              </>
            ) : (
              <>
                <XAxis dataKey="cliente" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
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
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {monedasPresentes.map((moneda) => (
              <Bar
                key={moneda}
                dataKey={moneda}
                name={moneda}
                fill={COLOR_MONEDA[moneda]}
                radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
