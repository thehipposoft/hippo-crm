import { CostoForm } from '@/components/costos/CostoForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { crearCosto } from './actions'

export default function NuevoCostoPage() {
  return (
    <PaginaFormulario titulo="Nuevo costo" volverHref="/costos" volverLabel="Volver a costos">
      <CostoForm accion={crearCosto} textoBoton="Guardar costo" />
    </PaginaFormulario>
  )
}
