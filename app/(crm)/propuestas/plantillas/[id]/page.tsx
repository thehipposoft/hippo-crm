import { PlantillaForm } from '@/components/propuestas/PlantillaForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import type { PlantillaRow } from '@/lib/types'
import { wpGetONotFound } from '@/lib/wp'
import { actualizarPlantilla } from '../actions'

export default async function EditarPlantillaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plantilla = await wpGetONotFound<PlantillaRow>(`/plantillas/${id}`)
  return (
    <PaginaFormulario titulo="Editar plantilla" volverHref="/propuestas/plantillas" volverLabel="Volver a plantillas" ancho>
      <PlantillaForm accion={actualizarPlantilla.bind(null, id)} textoBoton="Guardar cambios" plantilla={plantilla} />
    </PaginaFormulario>
  )
}
