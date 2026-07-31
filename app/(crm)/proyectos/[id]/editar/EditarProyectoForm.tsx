'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { actualizarProyecto, type EditarProyectoState } from './actions'
import { ESTADOS, type ClienteRow, type ProyectoRow } from '@/lib/types'

const initialState: EditarProyectoState = { error: null }

const toDateInputValue = (iso: string | null): string => {
  if (!iso) return ''
  return iso.slice(0, 10)
}

interface EditarProyectoFormProps {
  proyecto: ProyectoRow
  clientes: ClienteRow[]
}

export const EditarProyectoForm = ({ proyecto, clientes }: EditarProyectoFormProps) => {
  const actualizarProyectoConId = actualizarProyecto.bind(null, String(proyecto.id))
  const [state, formAction, pending] = useActionState(actualizarProyectoConId, initialState)

  return (
    <div className="px-8 py-8 max-w-xl">
      <div className="mb-7">
        <Link
          href={`/proyectos/${proyecto.id}`}
          className="text-xs text-dark-text/50 hover:text-dark-text transition-colors"
        >
          ← Volver al proyecto
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-dark-text">Editar proyecto</h1>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Nombre *
          </label>
          <input
            id="nombre" name="nombre" type="text" required defaultValue={proyecto.nombre}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            placeholder="Nombre del proyecto"
          />
        </div>

        <div>
          <label htmlFor="cliente_id" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Cliente *
          </label>
          <select
            id="cliente_id" name="cliente_id" required defaultValue={proyecto.clienteId}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
          >
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="estado" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Estado
          </label>
          <select
            id="estado" name="estado" defaultValue={proyecto.estado}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
          >
            {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha_inicio" className="block text-xs font-medium text-dark-text/60 mb-1.5">
              Fecha de inicio
            </label>
            <input
              id="fecha_inicio" name="fecha_inicio" type="date"
              defaultValue={toDateInputValue(proyecto.fechaInicio)}
              className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="deadline" className="block text-xs font-medium text-dark-text/60 mb-1.5">
              Deadline
            </label>
            <input
              id="deadline" name="deadline" type="date"
              defaultValue={toDateInputValue(proyecto.deadline)}
              className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="accion_pendiente" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Acción pendiente
          </label>
          <textarea
            id="accion_pendiente" name="accion_pendiente" rows={3}
            defaultValue={proyecto.accionPendiente ?? ''}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            placeholder="Opcional — qué falta hacer con este proyecto"
          />
        </div>

        {state.error && <p className="text-xs text-rose-600 pt-1">{state.error}</p>}

        <button
          type="submit" disabled={pending}
          className="w-full mt-2 rounded-lg bg-brand-blue hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium text-white transition"
        >
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
