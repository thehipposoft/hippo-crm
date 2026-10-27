import { cookies } from 'next/headers'
import { notFound, unstable_rethrow } from 'next/navigation'
import Link from 'next/link'
import { wpFetch } from '@/lib/wp'
import { FRECUENCIAS_PAGO, type CostoRow } from '@/lib/types'
import { formatFecha, formatMonto } from '@/lib/format'

const labelFrecuencia = (frecuencia: CostoRow['frecuencia']): string =>
  FRECUENCIAS_PAGO.find((f) => f.value === frecuencia)?.label ?? frecuencia

export default async function CostoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const token = (await cookies()).get('hippo_token')?.value

  let costo: CostoRow
  try {
    costo = await wpFetch(`/costos/${id}`, token)
  } catch (error) {
    unstable_rethrow(error)
    notFound()
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <Link href="/costos" className="text-xs text-dark-text/50 hover:text-dark-text transition-colors">
            ← Volver a costos
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-dark-text">{costo.nombreCosto}</h1>
        </div>
        <Link
          href={`/costos/${costo.id}/editar`}
          className="rounded-lg border border-slate-200 bg-white hover:bg-brand-blue/10 px-4 py-2 text-sm font-medium text-dark-text transition-colors"
        >
          Editar
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        <Field label="Monto" value={formatMonto(costo.monto, costo.moneda)} />
        <Field label="Moneda" value={costo.moneda} />
        <Field label="Frecuencia" value={labelFrecuencia(costo.frecuencia)} />
        <Field label="Método de pago" value={costo.metodoPago ?? '—'} />
        <Field label="Fecha de renovación" value={formatFecha(costo.fechaRenovacion)} />
        <Field label="Fecha de alta" value={formatFecha(costo.fechaInicio)} />
        <Field label="Fecha de baja" value={costo.fechaBaja ? formatFecha(costo.fechaBaja) : 'Activo'} />
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-xs font-medium text-dark-text/50 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-dark-text/80">{value}</span>
    </div>
  )
}
