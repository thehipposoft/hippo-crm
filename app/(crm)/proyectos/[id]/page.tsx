import Link from 'next/link'
import { Field } from '@/components/ui/Field'
import { wpGet, wpGetONotFound } from '@/lib/wp'
import { StatusBadge } from '@/components/proyectos/StatusBadge'
import { PagosTable } from '@/components/pagos/PagosTable'
import { FRECUENCIAS_PAGO, TIPOS_PROYECTO, type FrecuenciaPago, type PagoRow, type ProyectoRow } from '@/lib/types'
import { formatFecha, formatMonto } from '@/lib/format'
import { resumenPendiente } from '@/lib/proyectos'

const UNIDAD_PERIODO: Record<FrecuenciaPago, [string, string]> = {
  SEMANAL: ['semana', 'semanas'],
  MENSUAL: ['mes', 'meses'],
  ANUAL: ['año', 'años'],
}

const formatPeriodos = (cantidad: number, frecuencia: FrecuenciaPago): string => {
  const [singular, plural] = UNIDAD_PERIODO[frecuencia]
  return `${cantidad} ${cantidad === 1 ? singular : plural}`
}

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
  const proyecto = await wpGetONotFound<ProyectoRow>(`/proyectos/${id}`)

  const pagos = await wpGet<PagoRow[]>(`/proyectos/${id}/pagos`)
  const resumen = resumenPendiente(proyecto, pagos)
  const otrasMonedas = Object.entries(resumen.otrasMonedas)
    .map(([moneda, monto]) => formatMonto(monto, moneda))
    .join(' + ')

  return (
    <div className="max-w-2xl px-4 py-8 sm:px-8">
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
        <Field label="Fecha de inicio" value={formatFecha(proyecto.fechaInicio)} />
        <Field label="Deadline" value={formatFecha(proyecto.deadline)} />
        <Field label="Tipo de proyecto" value={labelTipoProyecto(proyecto.tipoProyecto)} />
        <Field label="Valor" value={formatMonto(proyecto.valor, resumen.moneda)} />
        {proyecto.tipoProyecto === 'RECURRENTE' && proyecto.frecuenciaPago && (
          <Field label="Frecuencia de pago" value={labelFrecuenciaPago(proyecto.frecuenciaPago)} />
        )}
        {resumen.periodos !== null && (
          <Field
            label="Adeudado a la fecha"
            value={`${formatMonto(resumen.adeudado, resumen.moneda)} (${formatPeriodos(resumen.periodos, proyecto.frecuenciaPago ?? 'MENSUAL')})`}
          />
        )}
        <Field label="Pagado" value={formatMonto(resumen.pagado, resumen.moneda)} />
        <Field label="Monto pendiente" value={formatMonto(resumen.pendiente, resumen.moneda)} />
        {otrasMonedas && <Field label="Pagos en otra moneda (sin descontar)" value={otrasMonedas} />}
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
