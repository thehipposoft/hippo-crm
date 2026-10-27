import { ClienteForm } from '@/components/clientes/ClienteForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import type { ClienteRow } from '@/lib/types'
import { wpGetONotFound } from '@/lib/wp'
import { actualizarCliente } from './actions'

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cliente = await wpGetONotFound<ClienteRow>(`/clientes/${id}`)

  return (
    <PaginaFormulario titulo="Editar cliente" volverHref={`/clientes/${id}`} volverLabel="Volver al cliente">
      <ClienteForm accion={actualizarCliente.bind(null, id)} textoBoton="Guardar cambios" cliente={cliente} />
    </PaginaFormulario>
  )
}
