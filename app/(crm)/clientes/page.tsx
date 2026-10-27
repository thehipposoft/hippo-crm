import { ClientesTable } from '@/components/clientes/ClientesTable'
import { PageHeader } from '@/components/ui/PageHeader'
import type { ClienteRow } from '@/lib/types'
import { wpGet } from '@/lib/wp'

export default async function ClientesPage() {
  const clientes = await wpGet<ClienteRow[]>('/clientes')

  return (
    <div className="px-4 py-8 sm:px-8">
      <PageHeader
        titulo="Clientes"
        cantidad={clientes.length}
        singular="cliente"
        plural="clientes"
        nuevoHref="/clientes/nuevo"
        nuevoLabel="Nuevo cliente"
      />
      <ClientesTable clientes={clientes} />
    </div>
  )
}
