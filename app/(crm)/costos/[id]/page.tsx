import Link from 'next/link'
import { Field } from '@/components/ui/Field'
import { wpGetONotFound } from '@/lib/wp'
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
  const costo = await wpGetONotFound<CostoRow>(`/costos/${id}`)

  return (
    <div className="max-w-2xl px-4 py-8 sm:px-8">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
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
