import { ProyectoForm } from '@/components/proyectos/ProyectoForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { aIso, hoy } from '@/lib/fechas'
import { totalesPropuesta } from '@/lib/propuestas'
import type { ClienteRow, PropuestaRow, ProyectoRow } from '@/lib/types'
import { wpGet, wpGetOpcional } from '@/lib/wp'
import { crearProyecto } from './actions'

// ?desde=<id de propuesta>: arranca con los datos de una propuesta aceptada (y la deja vinculada)
const desdePropuesta = async (
  id: string | undefined
): Promise<{ id: number; proyecto: Partial<ProyectoRow> } | undefined> => {
  if (!id || !/^\d+$/.test(id)) return undefined
  const propuesta = await wpGetOpcional<PropuestaRow | null>(`/propuestas/${id}`, null)
  if (!propuesta) return undefined
  return {
    id: propuesta.id,
    proyecto: {
      nombre: propuesta.titulo,
      clienteId: propuesta.clienteId ?? undefined,
      estado: 'ACTIVO',
      fechaInicio: aIso(hoy()),
      valor: totalesPropuesta(propuesta.items, propuesta.descuento).total,
      moneda: propuesta.moneda,
    },
  }
}

export default async function NuevoProyectoPage({ searchParams }: { searchParams: Promise<{ desde?: string }> }) {
  const { desde } = await searchParams
  const [clientes, inicial] = await Promise.all([wpGet<ClienteRow[]>('/clientes'), desdePropuesta(desde)])

  return (
    <PaginaFormulario titulo="Nuevo proyecto" volverHref="/proyectos" volverLabel="Volver a proyectos">
      <ProyectoForm
        accion={crearProyecto}
        textoBoton="Guardar proyecto"
        clientes={clientes}
        proyecto={inicial?.proyecto}
        desdePropuesta={inicial?.id}
      />
    </PaginaFormulario>
  )
}
