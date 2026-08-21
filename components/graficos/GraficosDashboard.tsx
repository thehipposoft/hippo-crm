'use client'

import { pagosPorCliente, pagosPorMes, proyectosPorEstado } from '@/lib/analytics'
import type { CostoRow, PagoRow, ProyectoRow } from '@/lib/types'
import { PerformanceCards } from './PerformanceCards'
import { TotalHistoricoCards } from './TotalHistoricoCards'
import { PagosPorMesChart } from './PagosPorMesChart'
import { PagosPorClienteChart } from './PagosPorClienteChart'
import { ProyectosPorEstadoChart } from './ProyectosPorEstadoChart'

interface GraficosDashboardProps {
  pagos: PagoRow[]
  costos: CostoRow[]
  proyectos: ProyectoRow[]
}

export const GraficosDashboard = ({ pagos, costos, proyectos }: GraficosDashboardProps) => {
  const dataPorMes = pagosPorMes(pagos)
  const dataPorCliente = pagosPorCliente(pagos)
  const dataPorEstado = proyectosPorEstado(proyectos)

  return (
    <div className="space-y-6">
      <PerformanceCards pagos={pagos} costos={costos} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PagosPorMesChart data={dataPorMes} />
        <ProyectosPorEstadoChart data={dataPorEstado} />
      </div>

      <PagosPorClienteChart data={dataPorCliente} />

      <TotalHistoricoCards pagos={pagos} />
    </div>
  )
}
