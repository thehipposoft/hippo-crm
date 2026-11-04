import Link from 'next/link'
import { EstadoPropuestaBadge } from '@/components/propuestas/EstadoPropuestaBadge'
import { fechaEnZona } from '@/lib/fechas'
import { formatFechaCorta } from '@/lib/format'
import { estadoVisible, numeroPropuesta } from '@/lib/propuestas'
import { resumenPropuestaProyecto } from '@/lib/propuestaProyecto'
import type { PropuestaRow, ProyectoRow } from '@/lib/types'
import { ArchivosProyecto } from './ArchivosProyecto'
import { FechasPropuesta } from './FechasPropuesta'

interface SeccionPropuestaProps {
  proyecto: ProyectoRow
  propuestas: PropuestaRow[]
}

const diaCorto = (iso: string | null): string | null => {
  const fecha = iso ? fechaEnZona(iso) : null
  return fecha ? formatFechaCorta(fecha) : null
}

// Ficha del proyecto: cuándo se envió y aprobó la propuesta, las del CRM vinculadas y los archivos
export const SeccionPropuesta = ({ proyecto, propuestas }: SeccionPropuestaProps) => {
  const { vinculadas, enviada, aprobada, dias } = resumenPropuestaProyecto(proyecto, propuestas)

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-dark-text">Propuesta</h2>
        <Link
          href={`/propuestas/nueva?tipo=PROPUESTA&cliente=${proyecto.clienteId}&proyecto=${proyecto.id}`}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-dark-text transition-colors hover:bg-brand-blue/10"
        >
          + Nueva propuesta
        </Link>
      </div>

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        <div className="px-5 py-4">
          <FechasPropuesta
            proyectoId={proyecto.id}
            enviada={enviada}
            aprobada={aprobada}
            dias={dias}
            manualEnviada={proyecto.propuestaEnviada ?? null}
            manualAprobada={proyecto.propuestaAprobada ?? null}
          />
        </div>

        {vinculadas.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {vinculadas.map((p) => {
              const enviadaEl = diaCorto(p.enviadaEl)
              const respondidaEl = diaCorto(p.respondidaEl)
              return (
                <li key={p.id}>
                  <Link href={`/propuestas/${p.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 transition-colors hover:bg-brand-white">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-dark-text">
                        <span className="mr-2 text-xs font-normal tabular-nums text-dark-text/40">{numeroPropuesta(p)}</span>
                        {p.titulo}
                      </p>
                      <p className="text-xs text-dark-text/50">
                        {[
                          enviadaEl ? `Enviada ${enviadaEl}` : 'Sin enviar',
                          p.vistaEl && 'vista',
                          respondidaEl && `${p.estado === 'ACEPTADA' ? 'aceptada' : 'rechazada'} ${respondidaEl}`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <EstadoPropuestaBadge estado={estadoVisible(p)} />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <div className="px-5 py-4">
          <ArchivosProyecto proyectoId={proyecto.id} archivos={proyecto.archivos ?? []} />
        </div>
      </div>
    </section>
  )
}
