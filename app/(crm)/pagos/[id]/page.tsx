import Link from 'next/link'
import { Field } from '@/components/ui/Field'
import { wpGetONotFound } from '@/lib/wp'
import { EliminarPagoButton } from '@/components/pagos/EliminarPagoButton'
import type { PagoRow } from '@/lib/types'
import { formatFecha, formatMonto } from '@/lib/format'

export default async function PagoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pago = await wpGetONotFound<PagoRow>(`/pagos/${id}`)

  return (
    <div className="max-w-2xl px-4 py-8 sm:px-8">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/pagos" className="text-xs text-dark-text/50 hover:text-dark-text transition-colors">
            ← Volver a pagos
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-dark-text">
            {formatMonto(pago.monto, pago.moneda)}
          </h1>
        </div>
        <div className="flex items-start gap-2">
          <Link
            href={`/documentos/recibo/${pago.id}`}
            className="rounded-lg border border-slate-200 bg-white hover:bg-brand-blue/10 px-4 py-2 text-sm font-medium text-dark-text transition-colors"
          >
            Recibo
          </Link>
          <Link
            href={`/pagos/${pago.id}/editar`}
            className="rounded-lg border border-slate-200 bg-white hover:bg-brand-blue/10 px-4 py-2 text-sm font-medium text-dark-text transition-colors"
          >
            Editar
          </Link>
          <EliminarPagoButton pagoId={pago.id} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs font-medium text-dark-text/50 uppercase tracking-wider">Proyecto</span>
          <Link
            href={`/proyectos/${pago.proyectoId}`}
            className="text-sm text-brand-blue hover:brightness-90 transition-colors"
          >
            {pago.proyectoNombre ?? '—'}
          </Link>
        </div>
        <Field label="Cliente" value={pago.clienteNombre ?? '—'} />
        <Field label="Fecha" value={formatFecha(pago.fecha)} />
        <Field label="Monto" value={formatMonto(pago.monto, pago.moneda)} />
        <Field label="Moneda" value={pago.moneda} />
        <Field label="Medio de pago" value={pago.medioPago ?? '—'} />
        <div className="px-5 py-4">
          <span className="block text-xs font-medium text-dark-text/50 uppercase tracking-wider mb-1.5">
            Notas
          </span>
          <p className="text-sm text-dark-text/80">
            {pago.notas || <span className="text-dark-text/40">Sin notas</span>}
          </p>
        </div>
      </div>
    </div>
  )
}
