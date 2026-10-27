import { HomeDashboard } from '@/components/home/HomeDashboard'
import { getNombreUsuario } from '@/lib/auth'
import type { CostoRow, PagoRow, ProyectoRow } from '@/lib/types'
import { wpGet } from '@/lib/wp'

export default async function Home() {
  const [userName, proyectos, pagos, costos] = await Promise.all([
    getNombreUsuario(),
    wpGet<ProyectoRow[]>('/proyectos'),
    wpGet<PagoRow[]>('/pagos'),
    wpGet<CostoRow[]>('/costos'),
  ])

  return <HomeDashboard userName={userName} proyectos={proyectos} pagos={pagos} costos={costos} />
}
