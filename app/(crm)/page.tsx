import { HomeDashboard } from '@/components/home/HomeDashboard'
import { getNombreUsuario } from '@/lib/auth'
import type { CostoRow, PagoRow, PropuestaRow, ProyectoRow, TareaRow } from '@/lib/types'
import { wpGet, wpGetOpcional } from '@/lib/wp'

export default async function Home() {
  const [userName, proyectos, pagos, costos, tareas, propuestas] = await Promise.all([
    getNombreUsuario(),
    wpGet<ProyectoRow[]>('/proyectos'),
    wpGet<PagoRow[]>('/pagos'),
    wpGet<CostoRow[]>('/costos'),
    // Si WordPress todavía no tiene tareas, el dashboard se muestra igual
    wpGetOpcional<TareaRow[]>('/tareas', []),
    wpGetOpcional<PropuestaRow[]>('/propuestas', []),
  ])

  return <HomeDashboard userName={userName} proyectos={proyectos} pagos={pagos} costos={costos} tareas={tareas} propuestas={propuestas} />
}
