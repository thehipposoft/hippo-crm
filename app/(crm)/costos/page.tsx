import { CostosTable } from '@/components/costos/CostosTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { TarjetaMontos } from '@/components/ui/Paneles'
import { costosEsteMes, costosEsteMesDetalle } from '@/lib/analytics'
import { aIso, hoy } from '@/lib/fechas'
import { formatMes } from '@/lib/format'
import type { CostoRow } from '@/lib/types'
import { wpGet } from '@/lib/wp'

export default async function CostosPage() {
  const costos = await wpGet<CostoRow[]>('/costos')
  const fechaHoy = hoy()
  const { pagado, falta } = costosEsteMesDetalle(costos)
  const mes = formatMes(fechaHoy)

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
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaMontos titulo={`Pagado · ${mes}`} montos={pagado} vacio="Nada registrado" ayuda="Pagos registrados del período" />
        <TarjetaMontos titulo={`Falta pagar · ${mes}`} montos={falta} vacio="Todo pagado" ayuda="Estimado de lo que no tiene pago" />
        <TarjetaMontos titulo={`Total · ${mes}`} montos={costosEsteMes(costos)} vacio="Sin costos" ayuda="Anuales prorrateados por mes" />
      </div>
      <CostosTable costos={costos} hoyIso={aIso(fechaHoy)} />
    </div>
  )
}
