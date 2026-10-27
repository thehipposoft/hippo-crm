import { ProyectoForm } from '@/components/proyectos/ProyectoForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import type { ClienteRow } from '@/lib/types'
import { wpGet } from '@/lib/wp'
import { crearProyecto } from './actions'

export default async function NuevoProyectoPage() {
  const clientes = await wpGet<ClienteRow[]>('/clientes')

  return (
    <PaginaFormulario titulo="Nuevo proyecto" volverHref="/proyectos" volverLabel="Volver a proyectos">
      <ProyectoForm accion={crearProyecto} textoBoton="Guardar proyecto" clientes={clientes} />
    </PaginaFormulario>
  )
}
