'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { actualizarCliente, type EditarClienteState } from './actions'
import type { ClienteRow } from '@/lib/types'

const initialState: EditarClienteState = { error: null }

interface EditarClienteFormProps {
  cliente: ClienteRow
}

export const EditarClienteForm = ({ cliente }: EditarClienteFormProps) => {
  const actualizarClienteConId = actualizarCliente.bind(null, String(cliente.id))
  const [state, formAction, pending] = useActionState(actualizarClienteConId, initialState)

  return (
    <div className="px-8 py-8 max-w-xl">
      <div className="mb-7">
        <Link
          href={`/clientes/${cliente.id}`}
          className="text-xs text-dark-text/50 hover:text-dark-text transition-colors"
        >
          ← Volver al cliente
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-dark-text">Editar cliente</h1>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Nombre de la empresa *
          </label>
          <input
            id="nombre" name="nombre" type="text" required defaultValue={cliente.nombre}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            placeholder="Ej: Acme Inc."
          />
        </div>

        <div>
          <label htmlFor="contacto" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Contacto
          </label>
          <input
            id="contacto" name="contacto" type="text" defaultValue={cliente.contacto ?? ''}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            placeholder="Nombre de la persona de contacto"
          />
        </div>

        <div>
          <label htmlFor="telefono" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Teléfono
          </label>
          <input
            id="telefono" name="telefono" type="tel" defaultValue={cliente.telefono ?? ''}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            placeholder="Opcional"
          />
        </div>

        <div>
          <label htmlFor="email_contacto" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            Email
          </label>
          <input
            id="email_contacto" name="email_contacto" type="email" defaultValue={cliente.emailContacto ?? ''}
            className="w-full rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            placeholder="Opcional"
          />
        </div>

        <div>
          <label htmlFor="pais" className="block text-xs font-medium text-dark-text/60 mb-1.5">
            País
          </label>
          <input
            id="pais" name="pais" type="text" defaultValue={cliente.pais ?? ''}
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
