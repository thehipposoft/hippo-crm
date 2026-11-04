'use client'

import { useState, useTransition } from 'react'
import { guardarFechasPropuesta } from '@/app/(crm)/proyectos/[id]/actions'
import { CLASES_CONTROL } from '@/components/ui/Formulario'
import { formatFecha } from '@/lib/format'
import { numeroPropuesta } from '@/lib/propuestas'
import type { FechaPropuesta } from '@/lib/propuestaProyecto'

interface FechasPropuestaProps {
  proyectoId: number
  enviada: FechaPropuesta | null
  aprobada: FechaPropuesta | null
  dias: number | null
  // Valores manuales guardados en el proyecto ('YYYY-MM-DD' o null)
  manualEnviada: string | null
  manualAprobada: string | null
}

const Origen = ({ fecha }: { fecha: FechaPropuesta | null }) => {
  if (!fecha) return null
  return (
    <p className="text-xs text-dark-text/40">
      {fecha.origen.tipo === 'MANUAL' ? 'Cargada a mano' : `Según ${numeroPropuesta(fecha.origen.propuesta)}`}
    </p>
  )
}

const Dato = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wider text-dark-text/50">{label}</p>
    <div className="mt-1">{children}</div>
  </div>
)

export const FechasPropuesta = ({ proyectoId, enviada, aprobada, dias, manualEnviada, manualAprobada }: FechasPropuestaProps) => {
  const [editando, setEditando] = useState(false)
  const [valorEnviada, setValorEnviada] = useState(manualEnviada?.slice(0, 10) ?? enviada?.fecha ?? '')
  const [valorAprobada, setValorAprobada] = useState(manualAprobada?.slice(0, 10) ?? aprobada?.fecha ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const guardar = () => {
    setError(null)
    startTransition(async () => {
      const resultado = await guardarFechasPropuesta(proyectoId, valorEnviada, valorAprobada)
      if (resultado.error) setError(resultado.error)
      else setEditando(false)
    })
  }

  if (editando) {
    return (
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          guardar()
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-dark-text/60">Enviada el</span>
            <input type="date" value={valorEnviada} onChange={(e) => setValorEnviada(e.target.value)} className={CLASES_CONTROL} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-dark-text/60">Aprobada el</span>
            <input type="date" value={valorAprobada} min={valorEnviada || undefined} onChange={(e) => setValorAprobada(e.target.value)} className={CLASES_CONTROL} />
          </label>
        </div>
        <p className="text-xs text-dark-text/40">Si dejás una fecha vacía, se toma de las propuestas del CRM vinculadas al proyecto.</p>
        {error && (
          <p role="alert" className="text-xs text-rose-600">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="rounded-lg bg-dark-text px-4 py-2 text-sm font-medium text-white transition hover:bg-dark-text/85 disabled:opacity-50">
            {pending ? 'Guardando...' : 'Guardar fechas'}
          </button>
          <button type="button" onClick={() => setEditando(false)} className="px-3 text-sm text-dark-text/60 hover:text-dark-text">
            Cancelar
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
        <Dato label="Enviada">
          <p className={`text-sm font-medium ${enviada ? 'text-dark-text' : 'text-dark-text/40'}`}>{enviada ? formatFecha(enviada.fecha) : 'Sin registrar'}</p>
          <Origen fecha={enviada} />
        </Dato>
        <Dato label="Aprobada">
          <p className={`text-sm font-medium ${aprobada ? 'text-brand-forest' : 'text-dark-text/40'}`}>{aprobada ? formatFecha(aprobada.fecha) : 'Todavía no'}</p>
          <Origen fecha={aprobada} />
        </Dato>
        {dias !== null && (
          <Dato label="Tardó">
            <p className="text-sm font-medium text-dark-text">{dias === 0 ? 'El mismo día' : `${dias} ${dias === 1 ? 'día' : 'días'}`}</p>
          </Dato>
        )}
      </div>
      <button type="button" onClick={() => setEditando(true)} className="rounded-md px-2 py-1 text-xs font-medium text-dark-text/60 transition-colors hover:bg-brand-blue/10 hover:text-dark-text">
        {enviada || aprobada ? 'Editar fechas' : 'Cargar fechas'}
      </button>
    </div>
  )
}
