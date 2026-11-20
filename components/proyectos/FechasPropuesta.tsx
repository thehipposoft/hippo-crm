'use client'

import { useState, useTransition } from 'react'
import { guardarRegistroPropuesta } from '@/app/(crm)/proyectos/[id]/actions'
import { CLASES_CONTROL } from '@/components/ui/Formulario'
import { formatFecha } from '@/lib/format'
import { numeroPropuesta } from '@/lib/propuestas'
import type { FechaPropuesta } from '@/lib/propuestaProyecto'
import { MEDIOS_APROBACION, type MedioAprobacion } from '@/lib/types'

// Registro manual guardado en el proyecto (propuestas hechas fuera del CRM)
export type RegistroManual = {
  enviada: string | null
  aprobada: string | null
  aprobadaPor: string | null
  medio: MedioAprobacion | null
  notas: string | null
}

interface FechasPropuestaProps {
  proyectoId: number
  enviada: FechaPropuesta | null
  aprobada: FechaPropuesta | null
  dias: number | null
  manual: RegistroManual
}

const MAX_APROBADA_POR = 120
const MAX_NOTAS = 2000
const ETIQUETA = 'mb-1.5 block text-xs font-medium text-dark-text/60'

const labelMedio = (medio: MedioAprobacion): string => MEDIOS_APROBACION.find((m) => m.value === medio)?.label ?? medio

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

// Quién aprobó y cómo: de las notas manuales o, si la aprobó en el link, de la firma
const NotasAprobacion = ({ aprobada, manual }: { aprobada: FechaPropuesta | null; manual: RegistroManual }) => {
  const firma = aprobada?.origen.tipo === 'CRM' ? aprobada.origen.propuesta.respuestaNombre : null
  if (firma) {
    return (
      <p className="text-sm text-dark-text/70">
        Aceptada por <span className="font-medium text-dark-text">{firma}</span> en el link de la propuesta.
      </p>
    )
  }
  if (!manual.aprobadaPor && !manual.medio && !manual.notas) return null
  return (
    <div className="space-y-1">
      {(manual.aprobadaPor || manual.medio) && (
        <p className="text-sm text-dark-text/70">
          {manual.aprobadaPor ? (
            <>
              Aprobó <span className="font-medium text-dark-text">{manual.aprobadaPor}</span>
            </>
          ) : (
            'Aprobada'
          )}
          {manual.medio && (
            <>
              {' '}
              por <span className="font-medium text-dark-text">{labelMedio(manual.medio)}</span>
            </>
          )}
        </p>
      )}
      {manual.notas && <p className="whitespace-pre-line text-sm text-dark-text/60">{manual.notas}</p>}
    </div>
  )
}

export const FechasPropuesta = ({ proyectoId, enviada, aprobada, dias, manual }: FechasPropuestaProps) => {
  const [editando, setEditando] = useState(false)
  const [valorEnviada, setValorEnviada] = useState('')
  const [valorAprobada, setValorAprobada] = useState('')
  const [aprobadaPor, setAprobadaPor] = useState('')
  const [medio, setMedio] = useState<MedioAprobacion | ''>('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // Las notas son para propuestas hechas fuera del CRM: si la aprobación viene de una propuesta
  // del CRM (con su firma), no hacen falta
  const conNotas = aprobada?.origen.tipo !== 'CRM'
  const hayRegistro = enviada || aprobada || manual.aprobadaPor || manual.medio || manual.notas

  // Al abrir el formulario se cargan los valores guardados (así "Cancelar" descarta lo escrito)
  const editar = () => {
    setValorEnviada(manual.enviada?.slice(0, 10) ?? enviada?.fecha ?? '')
    setValorAprobada(manual.aprobada?.slice(0, 10) ?? aprobada?.fecha ?? '')
    setAprobadaPor(manual.aprobadaPor ?? '')
    setMedio(manual.medio ?? '')
    setNotas(manual.notas ?? '')
    setError(null)
    setEditando(true)
  }

  const guardar = () => {
    setError(null)
    startTransition(async () => {
      const resultado = await guardarRegistroPropuesta(proyectoId, {
        enviada: valorEnviada,
        aprobada: valorAprobada,
        aprobadaPor: conNotas ? aprobadaPor : (manual.aprobadaPor ?? ''),
        medio: conNotas ? medio : (manual.medio ?? ''),
        notas: conNotas ? notas : (manual.notas ?? ''),
      })
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
            <span className={ETIQUETA}>Enviada el</span>
            <input type="date" value={valorEnviada} onChange={(e) => setValorEnviada(e.target.value)} className={CLASES_CONTROL} />
          </label>
          <label className="block">
            <span className={ETIQUETA}>Aprobada el</span>
            <input type="date" value={valorAprobada} min={valorEnviada || undefined} onChange={(e) => setValorAprobada(e.target.value)} className={CLASES_CONTROL} />
          </label>
        </div>
        <p className="text-xs text-dark-text/40">Si dejás una fecha vacía, se toma de las propuestas del CRM vinculadas al proyecto.</p>

        {conNotas && (
          <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3.5">
            <legend className="px-1 text-xs font-medium uppercase tracking-wider text-dark-text/50">Notas de la aprobación</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className={ETIQUETA}>Quién la aprobó</span>
                <input
                  value={aprobadaPor}
                  maxLength={MAX_APROBADA_POR}
                  placeholder="Ej. Martín Sima (socio)"
                  onChange={(e) => setAprobadaPor(e.target.value)}
                  className={CLASES_CONTROL}
                />
              </label>
              <label className="block">
                <span className={ETIQUETA}>Por qué medio</span>
                <select value={medio} onChange={(e) => setMedio(e.target.value as MedioAprobacion | '')} className={CLASES_CONTROL}>
                  <option value="">Sin especificar</option>
                  {MEDIOS_APROBACION.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className={ETIQUETA}>Notas</span>
              <textarea
                value={notas}
                rows={3}
                maxLength={MAX_NOTAS}
                placeholder="Ej. Aprobó por WhatsApp después de la reunión; pidió arrancar en marzo."
                onChange={(e) => setNotas(e.target.value)}
                className={CLASES_CONTROL}
              />
            </label>
          </fieldset>
        )}

        {error && (
          <p role="alert" className="text-xs text-rose-600">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="rounded-lg bg-dark-text px-4 py-2 text-sm font-medium text-white transition hover:bg-dark-text/85 disabled:opacity-50">
            {pending ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => setEditando(false)} className="px-3 text-sm text-dark-text/60 hover:text-dark-text">
            Cancelar
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-3">
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
        <button type="button" onClick={editar} className="rounded-md px-2 py-1 text-xs font-medium text-dark-text/60 transition-colors hover:bg-brand-blue/10 hover:text-dark-text">
          {hayRegistro ? 'Editar' : 'Cargar fechas y notas'}
        </button>
      </div>
      <NotasAprobacion aprobada={aprobada} manual={manual} />
    </div>
  )
}
