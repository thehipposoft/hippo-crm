import { CostosTable } from '@/components/costos/CostosTable'
import { PageHeader } from '@/components/ui/PageHeader'
import type { CostoRow } from '@/lib/types'
import { wpGet } from '@/lib/wp'

export default async function CostosPage() {
  const costos = await wpGet<CostoRow[]>('/costos')

  return (
    <div className="px-4 py-8 sm:px-8">
      <PageHeader
        titulo="Costos"
        cantidad={costos.length}
        singular="costo"
        plural="costos"
        nuevoHref="/costos/nuevo"
        nuevoLabel="Nuevo costo"
      />
      <CostosTable costos={costos} />
    </div>
  )
}
