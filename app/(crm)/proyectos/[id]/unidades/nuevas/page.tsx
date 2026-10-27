import { notFound } from 'next/navigation'
import { UnidadesNuevasForm } from '@/components/unidades/UnidadesNuevasForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { aIso, hoy } from '@/lib/fechas'
import type { ProyectoRow } from '@/lib/types'
import { cobraPorUnidad } from '@/lib/unidades'
import { wpGetONotFound } from '@/lib/wp'
import { crearUnidades } from '../actions'

export default async function NuevasUnidadesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const proyecto = await wpGetONotFound<ProyectoRow>(`/proyectos/${id}`)
  if (!cobraPorUnidad(proyecto) || !proyecto.unidad) notFound()

  return (
    <PaginaFormulario titulo={`Agregar ${proyecto.unidad}s — ${proyecto.nombre}`} volverHref={`/proyectos/${id}`} volverLabel="Volver al proyecto">
      <UnidadesNuevasForm accion={crearUnidades.bind(null, id)} unidad={proyecto.unidad} fechaPorDefecto={aIso(hoy())} />
    </PaginaFormulario>
  )
}
