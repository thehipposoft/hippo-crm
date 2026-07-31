'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { actualizarPago, type EditarPagoState } from './actions'
import { MEDIOS_PAGO, type PagoRow, type ProyectoRow } from '@/lib/types'

const initialState: EditarPagoState = { error: null }

const toDateInputValue = (iso: string | null): string => {
  if (!iso) return ''
  return iso.slice(0, 10)
}

interface EditarPagoFormProps {
  pago: PagoRow
  proyectos: ProyectoRow[]
}

export const EditarPagoForm = ({ pago, proyectos }: EditarPagoFormProps) => {
  const actualizarPagoConId = actualizarPago.bind(null, String(pago.id))
  const [state, formAction, pending] = useActionState(actualizarPagoConId, initialState)

  return (
    <div className="px-8 py-8 max-w-xl">
      <div className="mb-7">
        <Link
          href={`/pagos/${pago.id}`}
          className="text-xs text-dark-text/50 hover:text-dark-text transition-colors"
        >
          ← Volver al pago
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-dark-text">Editar pago</h1>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="proyecto_id" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Proyecto *
          </label>
          <select
            id="proyecto_id" name="proyecto_id" required defaultValue={pago.proyectoId}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
          >
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.clienteNombre})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha" className="block text-xs font-medium text-dark-text/60 mb-1.5">
              Fecha *
            </label>
            <input
              id="fecha" name="fecha" type="date" required
              defaultValue={toDateInputValue(pago.fecha)}
              className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="monto" className="block text-xs font-medium text-dark-text/60 mb-1.5">
              Monto *
            </label>
            <input
              id="monto" name="monto" type="number" step="0.01" required
              defaultValue={pago.monto}
              className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="medio_pago" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Medio de pago
          </label>
          <select
            id="medio_pago" name="medio_pago" defaultValue={pago.medioPago ?? 'Transferencia'}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
          >
            {MEDIOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="notas" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Notas adicionales
          </label>
          <textarea
            id="notas" name="notas" rows={3}
            defaultValue={pago.notas ?? ''}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            placeholder="Opcional"
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
