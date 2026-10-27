import Link from 'next/link'
import { aIso, hoy, indiceMes } from '@/lib/fechas'
import { formatMes, formatMonto } from '@/lib/format'
import type { Moneda, ProyectoRow } from '@/lib/types'
import { activasEsteMes, detallePorMes } from '@/lib/unidades'
import { ListaUnidades } from './ListaUnidades'

const PORCENTAJE = 100

interface SeccionUnidadesProps {
  proyecto: ProyectoRow
  moneda: Moneda
}

// Casillas (o la unidad que sea) del proyecto: activas por mes y la lista con altas y bajas
export const SeccionUnidades = ({ proyecto, moneda }: SeccionUnidadesProps) => {
  const etiqueta = proyecto.unidad ?? 'unidad'
  const fechaHoy = hoy()
  const meses = detallePorMes(proyecto, fechaHoy).reverse()
  const maximo = Math.max(1, ...meses.map((m) => m.activas))
  const activas = activasEsteMes(proyecto, fechaHoy)

  return (
    <section id="unidades" className="mt-8 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold capitalize text-dark-text">{etiqueta}s</h2>
          <p className="text-xs text-dark-text/50">
            {activas === null
              ? 'El contrato no corre este mes.'
              : `${activas} ${activas === 1 ? 'activa' : 'activas'} este mes · ${formatMonto(activas * proyecto.valor, moneda)}`}
          </p>
        </div>
        <Link
          href={`/proyectos/${proyecto.id}/unidades/nuevas`}
          className="flex items-center gap-2 rounded-lg bg-brand-blue px-3.5 py-2 text-xs font-medium text-white transition-colors hover:brightness-95"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar {etiqueta}s
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <h3 className="border-b border-slate-100 px-5 py-3 text-xs font-medium uppercase tracking-wider text-dark-text/50">
          Activas por mes
        </h3>
        {meses.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-dark-text/40">
            Cargá la fecha de inicio del proyecto o la primera {etiqueta}.
          </p>
        ) : (
          <div className="max-h-96 overflow-auto">
            <table className="w-full min-w-md text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-xs uppercase tracking-wider text-dark-text/50">
                  <th className="px-5 py-2 font-medium">Mes</th>
                  <th className="px-5 py-2 font-medium">Activas</th>
                  <th className="px-3 py-2 text-center font-medium">Altas</th>
                  <th className="px-3 py-2 text-center font-medium">Bajas</th>
                  <th className="px-5 py-2 text-right font-medium">Importe</th>
                </tr>
              </thead>
              <tbody>
                {meses.map((m) => (
                  <tr
                    key={aIso(m.mes)}
                    className={`border-t border-slate-100 ${indiceMes(m.mes) === indiceMes(fechaHoy) ? 'bg-brand-blue/5' : ''}`}
                  >
                    <td className="whitespace-nowrap px-5 py-2 capitalize text-dark-text/70">{formatMes(m.mes)}</td>
                    <td className="px-5 py-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-right font-medium tabular-nums">{m.activas}</span>
                        <div className="h-2 flex-1 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-brand-blue"
                            // Ancho proporcional: único valor que no puede ser una clase fija
                            style={{ width: `${(m.activas / maximo) * PORCENTAJE}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums text-emerald-700">{m.altas > 0 ? `+${m.altas}` : ''}</td>
                    <td className="px-3 py-2 text-center tabular-nums text-rose-600">{m.bajas > 0 ? `−${m.bajas}` : ''}</td>
                    <td className="whitespace-nowrap px-5 py-2 text-right tabular-nums text-dark-text/70">{formatMonto(m.monto, moneda)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ListaUnidades proyectoId={proyecto.id} unidades={proyecto.unidades ?? []} etiqueta={etiqueta} hoyIso={aIso(fechaHoy)} />
    </section>
  )
}
