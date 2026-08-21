'use client'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ESTADOS, type Estado } from '@/lib/types'
import { COLOR_ESTADO } from './colors'

const labelEstado = (estado: Estado): string => ESTADOS.find((e) => e.value === estado)?.label ?? estado

interface ProyectosPorEstadoChartProps {
  data: Array<{ estado: Estado; cantidad: number }>
}

export const ProyectosPorEstadoChart = ({ data }: ProyectosPorEstadoChartProps) => {
  const conDatos = data.filter((d) => d.cantidad > 0)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-dark-text">Proyectos por estado</h3>
      {conDatos.length === 0 ? (
        <p className="text-sm text-dark-text/40">Todavía no hay proyectos cargados.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={conDatos}
              dataKey="cantidad"
              nameKey="estado"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {conDatos.map((entry) => (
                <Cell key={entry.estado} fill={COLOR_ESTADO[entry.estado]} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, labelEstado(name as Estado)]}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend formatter={(value) => labelEstado(value as Estado)} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
