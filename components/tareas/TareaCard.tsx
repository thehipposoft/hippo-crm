'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { cambiarEstadoTarea } from '@/app/(crm)/tareas/actions'
import { formatDiasRelativos, formatFecha } from '@/lib/format'
import { ESTADOS_TAREA, type EstadoTarea, type Prioridad, type TareaRow } from '@/lib/types'

const DIAS_URGENTE = 3

const ESTILO_PRIORIDAD: Record<Prioridad, string> = {
  ALTA: 'bg-rose-50 text-rose-700 ring-rose-200',
  MEDIA: 'bg-amber-50 text-amber-700 ring-amber-200',
  BAJA: 'bg-slate-50 text-slate-500 ring-slate-200',
}

const LABEL_PRIORIDAD: Record<Prioridad, string> = { ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' }

interface TareaCardProps {
  tarea: TareaRow
  // Días hasta la fecha límite, calculado en el server (null = sin fecha o hecha)
  dias: number | null
  mostrarProyecto?: boolean
}

export const TareaCard = ({ tarea, dias, mostrarProyecto = true }: TareaCardProps) => {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const hecha = tarea.estado === 'HECHA'

  const cambiar = (estado: EstadoTarea) => {
    setError(null)
    startTransition(async () => {
      const resultado = await cambiarEstadoTarea(tarea.id, estado)
      if (resultado.error) setError(resultado.error)
    })
  }

  const colorFecha = dias === null ? 'text-dark-text/50' : dias < 0 ? 'text-rose-600' : dias <= DIAS_URGENTE ? 'text-orange-600' : 'text-dark-text/50'

  return (
    <article
      className={`rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs transition ${pending ? 'opacity-50' : ''} ${hecha ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={() => cambiar(hecha ? 'PENDIENTE' : 'HECHA')}
          disabled={pending}
          aria-label={hecha ? `Reabrir "${tarea.titulo}"` : `Marcar "${tarea.titulo}" como hecha`}
          className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-colors ${
            hecha ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500'
          }`}
        >
          {hecha && (
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <Link
            href={`/tareas/${tarea.id}/editar`}
            className={`text-sm font-medium text-dark-text hover:text-brand-blue ${hecha ? 'line-through' : ''}`}
          >
            {tarea.titulo}
          </Link>
          {tarea.descripcion && <p className="mt-0.5 line-clamp-2 text-xs text-dark-text/60">{tarea.descripcion}</p>}
          {mostrarProyecto && tarea.proyectoId && (
            <Link href={`/proyectos/${tarea.proyectoId}`} className="mt-1 block truncate text-xs text-brand-blue hover:underline">
              {tarea.proyectoNombre}
              {tarea.clienteNombre && <span className="text-dark-text/40"> · {tarea.clienteNombre}</span>}
            </Link>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className={`rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ${ESTILO_PRIORIDAD[tarea.prioridad]}`}>
            {LABEL_PRIORIDAD[tarea.prioridad]}
          </span>
          {tarea.fechaLimite && !hecha && (
            <span className={colorFecha} title={formatFecha(tarea.fechaLimite)}>
              {dias !== null && dias < 0 ? `Vencida ${formatDiasRelativos(dias)}` : `Vence ${formatDiasRelativos(dias ?? 0)}`}
            </span>
          )}
          {hecha && tarea.fechaHecha && <span className="text-dark-text/40">Hecha {formatFecha(tarea.fechaHecha)}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          {tarea.responsableNombre && (
            <span
              title={tarea.responsableNombre}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue/15 text-[10px] font-semibold text-cyan-800"
            >
              {tarea.responsableNombre[0]?.toUpperCase()}
            </span>
          )}
          <select
            value={tarea.estado}
            onChange={(e) => cambiar(e.target.value as EstadoTarea)}
            disabled={pending}
            aria-label="Cambiar estado"
            className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-dark-text/70 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            {ESTADOS_TAREA.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-rose-600">
          {error}
        </p>
      )}
    </article>
  )
}
