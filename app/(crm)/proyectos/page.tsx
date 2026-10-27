import { ProyectosTable } from '@/components/proyectos/ProyectosTable'
import { PageHeader } from '@/components/ui/PageHeader'
import type { PagoRow, ProyectoRow } from '@/lib/types'
import { wpGet } from '@/lib/wp'

export default async function ProyectosPage() {
  const [proyectos, pagos] = await Promise.all([wpGet<ProyectoRow[]>('/proyectos'), wpGet<PagoRow[]>('/pagos')])

  return (
    <div className="px-4 py-8 sm:px-8">
      <PageHeader
        titulo="Proyectos"
        cantidad={proyectos.length}
        singular="proyecto"
        plural="proyectos"
        nuevoHref="/proyectos/nuevo"
        nuevoLabel="Nuevo proyecto"
      />
      <ProyectosTable proyectos={proyectos} pagos={pagos} />
    </div>
  )
}
