import { CuentaForm } from '@/components/propuestas/CuentaForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { crearCuenta } from '../actions'

export default function NuevaCuentaPage() {
  return (
    <PaginaFormulario titulo="Nueva cuenta bancaria" volverHref="/propuestas/cuentas" volverLabel="Volver a cuentas">
      <CuentaForm accion={crearCuenta} textoBoton="Guardar cuenta" />
    </PaginaFormulario>
  )
}
