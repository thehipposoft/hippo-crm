import Link from 'next/link'
import { BotonEliminar } from '@/components/costos/BotonEliminar'
import { EstadoPeriodoBadge } from '@/components/costos/EstadoPeriodoBadge'
import { Field } from '@/components/ui/Field'
import { costoVigenteEn, etiquetaPeriodo, labelCategoria, periodosDelCosto, resumenPeriodo } from '@/lib/costos'
import { hoy } from '@/lib/fechas'
import { formatFecha, formatMonto } from '@/lib/format'
import { FRECUENCIAS_PAGO, type CostoRow } from '@/lib/types'
import { wpGetONotFound } from '@/lib/wp'
import { eliminarCosto } from './actions'
import { eliminarPagoCosto } from './pagos/actions'

const BOTON = 'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-dark-text transition-colors hover:bg-brand-blue/10'

const labelFrecuencia = (frecuencia: CostoRow['frecuencia']): string =>
  FRECUENCIAS_PAGO.find((f) => f.value === frecuencia)?.label ?? frecuencia

export default async function CostoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const costo = await wpGetONotFound<CostoRow>(`/costos/${id}`)
  const fechaHoy = hoy()

  const periodos = periodosDelCosto(costo, fechaHoy).map((p) => resumenPeriodo(costo, p))
  const pagos = [...(costo.pagos ?? [])].sort(
    (a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? '') || b.id - a.id
  )
  const vigente = costoVigenteEn(costo, fechaHoy)

  return (
    <div className="max-w-3xl px-4 py-8 sm:px-8">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/costos" className="text-xs text-dark-text/50 transition-colors hover:text-dark-text">
            ← Volver a costos
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-dark-text">{costo.nombreCosto}</h1>
          <p className="mt-0.5 text-sm text-dark-text/50">
            {[labelCategoria(costo.categoria), `${formatMonto(costo.monto, costo.moneda)} · ${labelFrecuencia(costo.frecuencia).toLowerCase()}`, !vigente && 'Inactivo']
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <Link
            href={`/costos/${costo.id}/pagos/nuevo`}
            className="rounded-lg bg-dark-text px-4 py-2 text-sm font-medium text-white transition hover:bg-dark-text/85"
          >
            Registrar pago
          </Link>
          <Link href={`/costos/${costo.id}/editar`} className={BOTON}>
            Editar
          </Link>
          <BotonEliminar
            accion={eliminarCosto.bind(null, costo.id)}
            titulo="¿Eliminar este costo?"
            mensaje="El costo y todos sus pagos registrados van a la papelera de WordPress. Si solo dejó de pagarse, mejor cargale la fecha de baja."
          />
        </div>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-dark-text">Períodos</h2>
        {periodos.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white px-5 py-6 text-center text-sm text-dark-text/40">
            Sin períodos para mostrar.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {periodos.map((r) => (
              <li key={r.periodo} className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-3">
                <span className="text-xs font-medium text-dark-text/70">{etiquetaPeriodo(r.periodo)}</span>
                <EstadoPeriodoBadge resumen={r} moneda={costo.moneda} />
                {r.estado === 'PAGADO' ? (
                  <span className="text-xs text-dark-text/50 tabular-nums">
                    {r.pagado > 0 ? formatMonto(r.pagado, costo.moneda) : 'Pagado en otra moneda'}
                  </span>
                ) : (
                  <Link
                    href={`/costos/${costo.id}/pagos/nuevo?periodo=${r.periodo}`}
                    className="text-xs font-medium text-brand-blue hover:brightness-90"
                  >
                    Registrar
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-dark-text">
          Pagos registrados <span className="font-normal text-dark-text/40">({pagos.length})</span>
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white">
          {pagos.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-dark-text/40">Todavía no registraste pagos de este costo.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pagos.map((pago) => (
                <li key={pago.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dark-text tabular-nums">
                      {formatMonto(pago.monto, pago.moneda)}
                      <span className="ml-2 font-normal text-dark-text/50">
                        {pago.periodo ? etiquetaPeriodo(pago.periodo) : 'Sin período'}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-dark-text/50">
                      {[`Pagado el ${formatFecha(pago.fecha)}`, pago.metodoPago, pago.notas].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/costos/${costo.id}/pagos/${pago.id}/editar`}
                      className="rounded-md px-2 py-1 text-xs font-medium text-dark-text/60 transition-colors hover:bg-brand-blue/10 hover:text-dark-text"
                    >
                      Editar
                    </Link>
                    <BotonEliminar
                      compacto
                      accion={eliminarPagoCosto.bind(null, costo.id, pago.id)}
                      titulo="¿Eliminar este pago?"
                      mensaje="Va a la papelera de WordPress: desde la app no se puede deshacer."
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        <Field label="Categoría" value={labelCategoria(costo.categoria) ?? '—'} />
        <Field label="Monto" value={formatMonto(costo.monto, costo.moneda)} />
        <Field label="Frecuencia" value={labelFrecuencia(costo.frecuencia)} />
        <Field label="Método de pago" value={costo.metodoPago ?? '—'} />
        <Field label="Fecha de renovación" value={formatFecha(costo.fechaRenovacion)} />
        <Field label="Fecha de alta" value={formatFecha(costo.fechaInicio)} />
        <Field label="Fecha de baja" value={costo.fechaBaja ? formatFecha(costo.fechaBaja) : 'Activo'} />
      </div>
    </div>
  )
}
