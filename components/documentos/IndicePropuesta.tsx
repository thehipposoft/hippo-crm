'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ModalRespuesta } from './ModalRespuesta'

export type EntradaIndice = { id: string; numero: string | null; titulo: string }

interface IndicePropuestaProps {
  entradas: EntradaIndice[]
  etiquetaContenido: string
  total: { etiqueta: string; monto: string }
  // Bloque de aceptar / rechazar (solo en el link público): "Responder" lo abre en un modal
  responder: { id: string; etiqueta: string; etiquetaCerrar: string; modal: ReactNode } | null
}

// Franja del viewport que define la sección "actual"
const MARGEN_OBSERVADOR = '-25% 0px -65% 0px'
const MARGEN_CHIP = 16

// Sección visible: la última que cruzó la franja superior de la pantalla
const useSeccionActiva = (ids: string[]) => {
  const [activa, setActiva] = useState(ids[0] ?? null)
  useEffect(() => {
    const elementos = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    const observador = new IntersectionObserver(
      (entradas) => {
        const visibles = entradas.filter((e) => e.isIntersecting)
        if (visibles.length > 0) setActiva(visibles[visibles.length - 1].target.id)
      },
      { rootMargin: MARGEN_OBSERVADOR }
    )
    elementos.forEach((el) => observador.observe(el))
    return () => observador.disconnect()
  }, [ids])
  return activa
}

// Índice de la propuesta: lateral fijo en desktop, chips arriba y barra con el total abajo en mobile
export const IndicePropuesta = ({ entradas, etiquetaContenido, total, responder }: IndicePropuestaProps) => {
  const [ids] = useState(() => entradas.map((e) => e.id))
  const activa = useSeccionActiva(ids)
  const chips = useRef<HTMLDivElement>(null)

  // En mobile, el chip activo siempre a la vista
  useEffect(() => {
    const contenedor = chips.current
    const chip = contenedor?.querySelector<HTMLElement>(`[data-seccion="${activa}"]`)
    if (contenedor && chip) contenedor.scrollTo({ left: chip.offsetLeft - MARGEN_CHIP, behavior: 'smooth' })
  }, [activa])

  const enRespuesta = responder !== null && activa === responder.id
  const [modalAbierto, setModalAbierto] = useState(false)

  return (
    <>
      <aside className="sticky top-0 z-20 -mx-4 border-b border-slate-200/70 bg-brand-white/90 backdrop-blur sm:-mx-8 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
        {/* Mobile: chips con scroll horizontal */}
        <nav aria-label={etiquetaContenido} className="lg:hidden">
          <div ref={chips} className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-8">
            {entradas.map((e) => (
              <a
                key={e.id}
                href={`#${e.id}`}
                data-seccion={e.id}
                aria-current={activa === e.id ? 'true' : undefined}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  activa === e.id ? 'border-dark-text bg-dark-text text-white' : 'border-slate-200 bg-white text-dark-text/70'
                }`}
              >
                {e.numero && <span className={activa === e.id ? 'text-brand-blue' : 'text-dark-text/40'}>{e.numero} </span>}
                {e.titulo}
              </a>
            ))}
          </div>
        </nav>

        {/* Desktop: índice lateral */}
        <div className="hidden lg:sticky lg:top-8 lg:block">
          <nav aria-label={etiquetaContenido}>
            <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-dark-text/50">{etiquetaContenido}</p>
            <ol className="space-y-1">
              {entradas.map((e) => (
                <li key={e.id}>
                  <a
                    href={`#${e.id}`}
                    aria-current={activa === e.id ? 'true' : undefined}
                    className={`flex items-baseline gap-2.5 rounded-xl border-2 px-3 py-2 text-sm transition-all ${
                      activa === e.id
                        ? 'border-dark-text bg-white font-semibold shadow-[3px_4px_0_0_var(--color-brand-olive)]'
                        : 'border-transparent text-dark-text/60 hover:text-dark-text'
                    }`}
                  >
                    <span className={`w-5 shrink-0 font-display text-xs tabular-nums ${activa === e.id ? 'text-brand-blue' : 'text-dark-text/30'}`}>
                      {e.numero ?? '·'}
                    </span>
                    {e.titulo}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="mt-6 rounded-2xl bg-dark-text p-4 text-white">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-white/60">{total.etiqueta}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{total.monto}</p>
            {responder && (
              <button
                type="button"
                onClick={() => setModalAbierto(true)}
                aria-haspopup="dialog"
                className="mt-3 block w-full rounded-lg bg-brand-green px-3 py-2 text-center text-sm font-semibold text-dark-text transition hover:brightness-95"
              >
                {responder.etiqueta}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile: total y "Responder" siempre a mano (se oculta al llegar a la respuesta) */}
      {responder && (
        <div
          className={`fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur transition-transform lg:hidden ${
            enRespuesta ? 'translate-y-full' : 'translate-y-0'
          }`}
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div>
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-dark-text/50">{total.etiqueta}</p>
              <p className="font-semibold tabular-nums">{total.monto}</p>
            </div>
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              aria-haspopup="dialog"
              className="rounded-lg bg-dark-text px-5 py-2.5 text-sm font-semibold text-white"
            >
              {responder.etiqueta}
            </button>
          </div>
        </div>
      )}

      {responder && (
        <ModalRespuesta abierto={modalAbierto} etiquetaCerrar={responder.etiquetaCerrar} onCerrar={() => setModalAbierto(false)}>
          {responder.modal}
        </ModalRespuesta>
      )}
    </>
  )
}
