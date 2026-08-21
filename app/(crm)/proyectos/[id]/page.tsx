import { cookies } from 'next/headers'
import { notFound, unstable_rethrow } from 'next/navigation'
import Link from 'next/link'
import { wpFetch } from '@/lib/wp'
import { StatusBadge } from '@/components/proyectos/StatusBadge'
import { PagosTable } from '@/components/pagos/PagosTable'
import { FRECUENCIAS_PAGO, TIPOS_PROYECTO, type PagoRow, type ProyectoRow } from '@/lib/types'

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatMonto = (valor: number): string => `$${new Intl.NumberFormat('es-UY').format(valor)}`

const labelTipoProyecto = (tipo: ProyectoRow['tipoProyecto']): string =>
  TIPOS_PROYECTO.find((t) => t.value === tipo)?.label ?? tipo

const labelFrecuenciaPago = (frecuencia: NonNullable<ProyectoRow['frecuenciaPago']>): string =>
  FRECUENCIAS_PAGO.find((f) => f.value === frecuencia)?.label ?? frecuencia

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const token = (await cookies()).get('hippo_token')?.value

  let proyecto: ProyectoRow
  try {
    proyecto = await wpFetch(`/proyectos/${id}`, token)
  } catch (error) {
    unstable_rethrow(error)
    notFound()
  }

  const pagos = await wpFetch<PagoRow[]>(`/proyectos/${id}/pagos`, token)

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <Link href="/proyectos" className="text-xs text-dark-text/50 hover:text-dark-text transition-colors">
            ← Volver a proyectos
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-dark-text">{proyecto.nombre}</h1>
        </div>
        <Link
          href={`/proyectos/${proyecto.id}/editar`}
          className="rounded-lg border border-slate-200 bg-white hover:bg-brand-blue/10 px-4 py-2 text-sm font-medium text-dark-text transition-colors"
        >
          Editar
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs font-medium text-dark-text/50 uppercase tracking-wider">Cliente</span>
          <Link
            href={`/clientes/${proyecto.clienteId}`}
            className="text-sm text-brand-blue hover:brightness-90 transition-colors"
          >
            {proyecto.clienteNombre}
          </Link>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs font-medium text-dark-text/50 uppercase tracking-wider">Estado</span>
          <StatusBadge estado={proyecto.estado} />
        </div>
        <Field label="Fecha de inicio" value={formatDate(proyecto.fechaInicio)} />
        <Field label="Deadline" value={formatDate(proyecto.deadline)} />
        <Field label="Tipo de proyecto" value={labelTipoProyecto(proyecto.tipoProyecto)} />
        <Field label="Valor" value={formatMonto(proyecto.valor)} />
        {proyecto.tipoProyecto === 'RECURRENTE' && proyecto.frecuenciaPago && (
          <Field label="Frecuencia de pago" value={labelFrecuenciaPago(proyecto.frecuenciaPago)} />
        )}
        <Field label="Monto pendiente" value={formatMonto(proyecto.montoPendiente)} />
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs font-medium text-dark-text/50 uppercase tracking-wider">URL</span>
          {proyecto.url ? (
            <a
              href={proyecto.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-blue hover:brightness-90 transition-colors truncate max-w-xs"
            >
              {proyecto.url}
            </a>
          ) : (
            <span className="text-sm text-dark-text/40">—</span>
          )}
        </div>
        <div className="px-5 py-4">
          <span className="block text-xs font-medium text-dark-text/50 uppercase tracking-wider mb-1.5">
            Acción pendiente
          </span>
          <p className="text-sm text-dark-text/80">
            {proyecto.accionPendiente || <span className="text-dark-text/40">Nada pendiente</span>}
          </p>
        </div>
      </div>

      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-dark-text">Pagos</h2>
        <Link
          href={`/pagos/nuevo?proyecto=${proyecto.id}`}
          className="flex items-center gap-2 rounded-lg bg-brand-blue hover:brightness-95 px-3.5 py-2 text-xs font-medium text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Registrar pago
        </Link>
      </div>
      <PagosTable pagos={pagos} mostrarProyecto={false} />
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
