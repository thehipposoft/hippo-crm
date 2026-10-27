import { PagosTable } from '@/components/pagos/PagosTable'
import { PageHeader } from '@/components/ui/PageHeader'
import type { PagoRow } from '@/lib/types'
import { wpGet } from '@/lib/wp'

export default async function PagosPage() {
  const pagos = await wpGet<PagoRow[]>('/pagos')

  return (
    <div className="px-4 py-8 sm:px-8">
      <PageHeader
        titulo="Pagos"
        cantidad={pagos.length}
        singular="pago"
        plural="pagos"
        nuevoHref="/pagos/nuevo"
        nuevoLabel="Nuevo pago"
      />
      <PagosTable pagos={pagos} />
    </div>
  )
}
