import { PlantillaForm } from '@/components/propuestas/PlantillaForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { crearPlantilla } from '../actions'

export default function NuevaPlantillaPage() {
  return (
    <PaginaFormulario titulo="Nueva plantilla" volverHref="/propuestas/plantillas" volverLabel="Volver a plantillas" ancho>
      <PlantillaForm accion={crearPlantilla} textoBoton="Guardar plantilla" />
    </PaginaFormulario>
  )
}
