import { ClienteForm } from '@/components/clientes/ClienteForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { crearCliente } from './actions'

export default function NuevoClientePage() {
  return (
    <PaginaFormulario titulo="Nuevo cliente" volverHref="/clientes" volverLabel="Volver a clientes">
      <ClienteForm accion={crearCliente} textoBoton="Guardar cliente" />
    </PaginaFormulario>
  )
}
