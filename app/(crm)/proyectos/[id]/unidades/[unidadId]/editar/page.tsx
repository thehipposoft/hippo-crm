import { notFound } from 'next/navigation'
import { UnidadForm } from '@/components/unidades/UnidadForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import type { ProyectoRow, UnidadRow } from '@/lib/types'
import { wpGetONotFound } from '@/lib/wp'
import { actualizarUnidad } from '../../actions'

export default async function EditarUnidadPage({ params }: { params: Promise<{ id: string; unidadId: string }> }) {
  const { id, unidadId } = await params
  const [proyecto, unidad] = await Promise.all([
    wpGetONotFound<ProyectoRow>(`/proyectos/${id}`),
    wpGetONotFound<UnidadRow>(`/unidades/${unidadId}`),
  ])
  if (Number(unidad.proyectoId) !== Number(proyecto.id)) notFound()
  const etiqueta = proyecto.unidad ?? 'unidad'

  return (
    <PaginaFormulario titulo={`Editar ${etiqueta}`} volverHref={`/proyectos/${id}`} volverLabel="Volver al proyecto">
      <UnidadForm accion={actualizarUnidad.bind(null, id, unidadId)} unidad={unidad} etiqueta={etiqueta} />
    </PaginaFormulario>
  )
}
