'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { actualizarCosto, type EditarCostoState } from './actions'
import { FRECUENCIAS_PAGO, MEDIOS_PAGO, MONEDAS, type CostoRow } from '@/lib/types'

const initialState: EditarCostoState = { error: null }

const toDateInputValue = (iso: string | null): string => {
  if (!iso) return ''
  return iso.slice(0, 10)
}

interface EditarCostoFormProps {
  costo: CostoRow
}

export const EditarCostoForm = ({ costo }: EditarCostoFormProps) => {
  const actualizarCostoConId = actualizarCosto.bind(null, String(costo.id))
  const [state, formAction, pending] = useActionState(actualizarCostoConId, initialState)

  return (
    <div className="px-8 py-8 max-w-xl">
      <div className="mb-7">
        <Link
          href={`/costos/${costo.id}`}
          className="text-xs text-dark-text/50 hover:text-dark-text transition-colors"
        >
          ← Volver al costo
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-dark-text">Editar costo</h1>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="nombre_costo" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Nombre del costo *
          </label>
          <input
            id="nombre_costo" name="nombre_costo" type="text" required defaultValue={costo.nombreCosto}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            placeholder="Nombre del costo"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="monto" className="block text-xs font-medium text-dark-text/60 mb-1.5">
              Monto *
            </label>
            <input
              id="monto" name="monto" type="number" step="0.01" required defaultValue={costo.monto}
              className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
              placeholder="0.00"
            />
          </div>
          <div>
            <label htmlFor="moneda" className="block text-xs font-medium text-dark-text/60 mb-1.5">
              Moneda
            </label>
            <select
              id="moneda" name="moneda" defaultValue={costo.moneda}
              className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            >
              {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="frecuencia" className="block text-xs font-medium text-dark-text/60 mb-1.5">
              Frecuencia
            </label>
            <select
              id="frecuencia" name="frecuencia" defaultValue={costo.frecuencia}
              className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            >
              {FRECUENCIAS_PAGO.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="metodo_pago" className="block text-xs font-medium text-dark-text/60 mb-1.5">
              Método de pago
            </label>
            <select
              id="metodo_pago" name="metodo_pago" defaultValue={costo.metodoPago ?? 'Transferencia'}
              className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            >
              {MEDIOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="fecha_renovacion" className="block text-xs font-medium text-dark-text/60 mb-1.5">
              Fecha de renovación
            </label>
            <input
              id="fecha_renovacion" name="fecha_renovacion" type="date"
              defaultValue={toDateInputValue(costo.fechaRenovacion)}
              className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha_inicio" className="block text-xs font-medium text-dark-text/60 mb-1.5">
              Fecha de alta
            </label>
            <input
              id="fecha_inicio" name="fecha_inicio" type="date" defaultValue={toDateInputValue(costo.fechaInicio ?? null)}
              className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="fecha_baja" className="block text-xs font-medium text-dark-text/60 mb-1.5">
              Fecha de baja
            </label>
            <input
              id="fecha_baja" name="fecha_baja" type="date" defaultValue={toDateInputValue(costo.fechaBaja ?? null)}
              className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-dark-text/40">Sin fecha de baja = sigue activo. Solo se suma en los meses entre alta y baja.</p>

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
