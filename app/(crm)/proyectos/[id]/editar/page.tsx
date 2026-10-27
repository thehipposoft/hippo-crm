import { ProyectoForm } from '@/components/proyectos/ProyectoForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { monedaProyecto } from '@/lib/proyectos'
import type { ClienteRow, PagoRow, ProyectoRow } from '@/lib/types'
import { wpGet, wpGetONotFound } from '@/lib/wp'
import { actualizarProyecto } from './actions'

export default async function EditarProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const proyecto = await wpGetONotFound<ProyectoRow>(`/proyectos/${id}`)
  const [clientes, pagos] = await Promise.all([
    wpGet<ClienteRow[]>('/clientes'),
    wpGet<PagoRow[]>(`/proyectos/${id}/pagos`),
  ])

  return (
    <PaginaFormulario titulo="Editar proyecto" volverHref={`/proyectos/${id}`} volverLabel="Volver al proyecto">
      <ProyectoForm
        accion={actualizarProyecto.bind(null, id)}
        textoBoton="Guardar cambios"
        clientes={clientes}
        proyecto={proyecto}
        monedaInicial={monedaProyecto(proyecto, pagos)}
      />
    </PaginaFormulario>
  )
}
