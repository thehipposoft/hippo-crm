'use client'

import { useId, useState, useTransition } from 'react'
import { responderPropuesta } from '@/app/propuesta/[token]/actions'
import { fechaDoc } from '@/lib/documentos/idioma'
import { TEXTOS_PROPUESTA } from '@/lib/documentos/textosPropuesta'
import { fechaEnZona } from '@/lib/fechas'
import type { PropuestaPublica } from '@/lib/types'
import { MAX_COMENTARIO_RESPUESTA, MAX_NOMBRE_RESPUESTA } from '@/lib/validations/propuesta'

type Accion = 'ACEPTAR' | 'RECHAZAR'

interface RespuestaPropuestaProps {
  token: string
  propuesta: PropuestaPublica
  // Dentro del modal de "Responder": sin borde propio (el modal ya es la tarjeta)
  enModal?: boolean
}

const CLASES_CONTROL =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue'

// Aceptar / rechazar desde el link. Una vez respondida queda el registro (también sale en el PDF).
// Se usa al final de la propuesta ("¿Avanzamos?") y en el modal que abre "Responder".
export const RespuestaPropuesta = ({ token, propuesta, enModal = false }: RespuestaPropuestaProps) => {
  const t = TEXTOS_PROPUESTA[propuesta.idioma]
  // Ids únicos: el bloque puede estar dos veces en la página (al final y en el modal)
  const id = useId()
  const idTitulo = `${id}-titulo`
  const idNombre = `${id}-nombre`
  const idComentario = `${id}-comentario`
  const [accion, setAccion] = useState<Accion | null>(null)
  const [nombre, setNombre] = useState('')
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const respondidaEl = propuesta.respondidaEl ? fechaDoc(fechaEnZona(propuesta.respondidaEl), propuesta.idioma) : null

  if (propuesta.estado === 'ACEPTADA') {
    return (
      <Aviso tono="ok" enModal={enModal}>
        <p className="font-semibold">{t.aceptadaPor(propuesta.respuestaNombre, respondidaEl ?? '—')}</p>
        <p className="mt-0.5 print:hidden">{t.graciasAceptar}</p>
      </Aviso>
    )
  }
  if (propuesta.estado === 'RECHAZADA') {
    return (
      <Aviso tono="neutro" enModal={enModal}>
        <p className="font-semibold">{t.rechazadaEl(respondidaEl ?? '—')}</p>
        <p className="mt-0.5 print:hidden">{t.graciasRechazo}</p>
      </Aviso>
    )
  }
  if (propuesta.vencida) {
    return (
      <Aviso tono="alerta" enModal={enModal}>
        <p>{t.vencida(fechaDoc(propuesta.fechaVencimiento, propuesta.idioma))}</p>
      </Aviso>
    )
  }

  const enviar = () => {
    if (!accion) return
    setError(null)
    startTransition(async () => {
      const resultado = await responderPropuesta(token, { accion, nombre, comentario })
      if (resultado.error === 'NOMBRE') setError(t.nombreAyuda)
      else if (resultado.error === 'YA_RESPONDIDA') setError(t.yaRespondida)
      else if (resultado.error === 'VENCIDA') setError(t.vencida(fechaDoc(propuesta.fechaVencimiento, propuesta.idioma)))
      else if (resultado.error) setError(t.errorRespuesta)
      // Si salió bien, la página se vuelve a renderizar con el estado nuevo
    })
  }

  return (
    <section
      className={enModal ? 'p-6 pr-14 sm:p-8 sm:pr-16' : 'rounded-2xl border-2 border-dark-text p-6 sm:p-8 print:hidden'}
      aria-labelledby={idTitulo}
    >
      <h2 id={idTitulo} className="font-display text-2xl font-semibold tracking-tight">
        {t.tuRespuesta}
      </h2>
      <p className="mt-1 text-sm text-dark-text/60">{t.tuRespuestaAyuda}</p>

      {accion === null ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setAccion('ACEPTAR')}
            className="rounded-lg bg-dark-text px-6 py-3 text-sm font-semibold text-white transition hover:bg-dark-text/85"
          >
            {t.aceptar}
          </button>
          <button
            type="button"
            onClick={() => setAccion('RECHAZAR')}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-dark-text/70 transition hover:bg-slate-50"
          >
            {t.rechazar}
          </button>
        </div>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            enviar()
          }}
        >
          {accion === 'ACEPTAR' && (
            <div>
              <label htmlFor={idNombre} className="mb-1.5 block text-xs font-medium text-dark-text/60">
                {t.nombreCompleto} *
              </label>
              <input
                id={idNombre}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                maxLength={MAX_NOMBRE_RESPUESTA}
                autoComplete="name"
                className={CLASES_CONTROL}
              />
              <p className="mt-1 text-xs text-dark-text/40">{t.nombreAyuda}</p>
            </div>
          )}
          <div>
            <label htmlFor={idComentario} className="mb-1.5 block text-xs font-medium text-dark-text/60">
              {accion === 'ACEPTAR' ? t.comentario : t.motivoRechazo}
            </label>
            <textarea
              id={idComentario}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              maxLength={MAX_COMENTARIO_RESPUESTA}
              className={CLASES_CONTROL}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className={`rounded-lg px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${
                accion === 'ACEPTAR' ? 'bg-dark-text hover:bg-dark-text/85' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {pending ? t.enviando : accion === 'ACEPTAR' ? t.confirmarAceptar : t.confirmarRechazo}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setAccion(null)
                setError(null)
              }}
              className="px-3 text-sm text-dark-text/60 hover:text-dark-text"
            >
              {t.cancelar}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

const TONOS = {
  ok: 'border-brand-forest/30 bg-brand-forest/5 text-brand-forest',
  neutro: 'border-slate-200 bg-slate-50 text-dark-text/80',
  alerta: 'border-brand-orange/40 bg-brand-orange/5 text-dark-text',
} as const

const Aviso = ({ tono, enModal, children }: { tono: keyof typeof TONOS; enModal: boolean; children: React.ReactNode }) => {
  const aviso = <section className={`break-inside-avoid rounded-2xl border p-5 text-sm ${TONOS[tono]}`}>{children}</section>
  // En el modal, aire alrededor y lugar para la cruz de cerrar
  return enModal ? <div className="p-6 pt-16 sm:p-8 sm:pt-16">{aviso}</div> : aviso
}
