import Link from 'next/link'
import { TareaCard } from './TareaCard'
import { hoy } from '@/lib/fechas'
import { agruparPorEstado, diasParaVencer, estaAbierta } from '@/lib/tareas'
import type { TareaRow } from '@/lib/types'

interface TareasProyectoProps {
  proyectoId: number
  tareas: TareaRow[]
}

// Tareas abiertas del proyecto (las hechas quedan en la pestaña Tareas)
export const TareasProyecto = ({ proyectoId, tareas }: TareasProyectoProps) => {
  const fechaHoy = hoy()
  const delProyecto = tareas.filter((t) => Number(t.proyectoId) === Number(proyectoId))
  const grupos = agruparPorEstado(delProyecto.filter(estaAbierta))
  const abiertas = [...grupos.BLOQUEADA, ...grupos.EN_CURSO, ...grupos.PENDIENTE]
  const hechas = delProyecto.length - abiertas.length

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-dark-text">
          Tareas
          {hechas > 0 && (
            <Link href="/tareas?hechas=1" className="ml-2 text-xs font-normal text-dark-text/50 hover:text-brand-blue">
              ({hechas} {hechas === 1 ? 'hecha' : 'hechas'})
            </Link>
          )}
        </h2>
        <Link
          href={`/tareas/nueva?proyecto=${proyectoId}&volver=/proyectos/${proyectoId}`}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-dark-text transition-colors hover:bg-brand-blue/10"
        >
          + Nueva tarea
        </Link>
      </div>
      {abiertas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-dark-text/40">
          No hay tareas abiertas para este proyecto.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {abiertas.map((t) => (
            <TareaCard key={t.id} tarea={t} dias={diasParaVencer(t, fechaHoy)} mostrarProyecto={false} />
          ))}
        </div>
      )}
    </section>
  )
}
