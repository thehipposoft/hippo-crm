import { wpGet } from '@/lib/wp'
import { GraficosDashboard } from '@/components/graficos/GraficosDashboard'
import type { CostoRow, PagoRow, ProyectoRow } from '@/lib/types'

export default async function GraficosPage() {
  const [pagos, costos, proyectos] = await Promise.all([
    wpGet<PagoRow[]>('/pagos'),
    wpGet<CostoRow[]>('/costos'),
    wpGet<ProyectoRow[]>('/proyectos'),
  ])

  return (
    <div className="px-8 py-8">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-dark-text">Gráficos</h1>
        <p className="mt-0.5 text-sm text-dark-text/50">Resumen financiero y de proyectos</p>
      </div>

      <GraficosDashboard pagos={pagos} costos={costos} proyectos={proyectos} />
    </div>
  )
}
