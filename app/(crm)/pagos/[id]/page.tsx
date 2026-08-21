import { cookies } from 'next/headers'
import { notFound, unstable_rethrow } from 'next/navigation'
import Link from 'next/link'
import { wpFetch } from '@/lib/wp'
import type { PagoRow } from '@/lib/types'

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatMonto = (monto: number, moneda: string): string =>
  new Intl.NumberFormat('es-UY', { style: 'currency', currency: moneda }).format(monto)

export default async function PagoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const token = (await cookies()).get('hippo_token')?.value

  let pago: PagoRow
  try {
    pago = await wpFetch(`/pagos/${id}`, token)
  } catch (error) {
    unstable_rethrow(error)
    notFound()
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <Link href="/pagos" className="text-xs text-dark-text/50 hover:text-dark-text transition-colors">
            ← Volver a pagos
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-dark-text">
            {formatMonto(pago.monto, pago.moneda)}
          </h1>
        </div>
        <Link
          href={`/pagos/${pago.id}/editar`}
          className="rounded-lg border border-slate-200 bg-white hover:bg-brand-blue/10 px-4 py-2 text-sm font-medium text-dark-text transition-colors"
        >
          Editar
        </Link>
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
        <Field label="Fecha" value={formatDate(pago.fecha)} />
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-xs font-medium text-dark-text/50 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-dark-text/80">{value}</span>
    </div>
  )
}
