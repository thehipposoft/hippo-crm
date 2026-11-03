'use client'

import { useState } from 'react'
import { Markdown } from '@/components/documentos/Markdown'
import { CLASES_CONTROL } from '@/components/ui/Formulario'
import type { SeccionPropuesta } from '@/lib/types'
import { BotonIcono, ICONOS } from './BotonIcono'

const FILAS_MINIMAS = 4
const FILAS_MAXIMAS = 18

const AYUDA_FORMATO = [
  ['**negrita**', 'negrita'],
  ['*cursiva*', 'cursiva'],
  ['- ítem', 'lista'],
  ['1. ítem', 'lista numerada'],
  ['### Título', 'subtítulo'],
  ['| A | B |', 'tabla (2.ª línea |---|---|)'],
] as const

interface EditorSeccionesProps {
  secciones: SeccionPropuesta[]
  onChange: (secciones: SeccionPropuesta[]) => void
}

// Secciones libres de la propuesta: título + texto con formato simple, con vista previa
export const EditorSecciones = ({ secciones, onChange }: EditorSeccionesProps) => {
  const [vistaPrevia, setVistaPrevia] = useState<Set<number>>(new Set())

  const cambiar = (i: number, cambios: Partial<SeccionPropuesta>) =>
    onChange(secciones.map((s, j) => (j === i ? { ...s, ...cambios } : s)))
  const mover = (i: number, delta: number) => {
    const destino = i + delta
    if (destino < 0 || destino >= secciones.length) return
    const copia = [...secciones]
    ;[copia[i], copia[destino]] = [copia[destino], copia[i]]
    onChange(copia)
    setVistaPrevia(new Set())
  }
  const alternarVista = (i: number) =>
    setVistaPrevia((actual) => {
      const nuevo = new Set(actual)
      if (nuevo.has(i)) nuevo.delete(i)
      else nuevo.add(i)
      return nuevo
    })

  return (
    <div className="space-y-3">
      <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-dark-text/40">
        Formato:
        {AYUDA_FORMATO.map(([sintaxis, label]) => (
          <span key={sintaxis}>
            <code className="rounded bg-slate-100 px-1 text-dark-text/70">{sintaxis}</code> {label}
          </span>
        ))}
      </p>

      {secciones.map((seccion, i) => {
        const enVista = vistaPrevia.has(i)
        const filas = Math.min(FILAS_MAXIMAS, Math.max(FILAS_MINIMAS, seccion.contenido.split('\n').length + 1))
        return (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <span className="w-6 shrink-0 font-semibold tabular-nums text-brand-blue">{String(i + 1).padStart(2, '0')}</span>
              <input
                aria-label={`Título de la sección ${i + 1}`}
                value={seccion.titulo}
                onChange={(e) => cambiar(i, { titulo: e.target.value })}
                placeholder="Título de la sección"
                className={`${CLASES_CONTROL} font-medium`}
              />
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => alternarVista(i)}
                  aria-pressed={enVista}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    enVista ? 'bg-dark-text text-white' : 'text-dark-text/50 hover:bg-slate-100 hover:text-dark-text'
                  }`}
                >
                  Vista previa
                </button>
                <BotonIcono label="Subir" icono={ICONOS.subir} onClick={() => mover(i, -1)} disabled={i === 0} />
                <BotonIcono label="Bajar" icono={ICONOS.bajar} onClick={() => mover(i, 1)} disabled={i === secciones.length - 1} />
                <BotonIcono
                  label="Quitar sección"
                  icono={ICONOS.quitar}
                  onClick={() => {
                    onChange(secciones.filter((_, j) => j !== i))
                    setVistaPrevia(new Set())
                  }}
                  peligro
                />
              </div>
            </div>
            <div className="mt-2 sm:pl-8">
              {enVista ? (
                <div className="min-h-24 rounded-lg bg-brand-white px-4 py-3">
                  <Markdown texto={seccion.contenido || '_(vacía)_'} />
                </div>
              ) : (
                <textarea
                  aria-label={`Contenido de la sección ${i + 1}`}
                  value={seccion.contenido}
                  onChange={(e) => cambiar(i, { contenido: e.target.value })}
                  rows={filas}
                  className={`${CLASES_CONTROL} resize-y font-mono text-[0.8125rem] leading-relaxed`}
                />
              )}
            </div>
          </div>
        )
      })}

      <button
        type="button"
        onClick={() => onChange([...secciones, { titulo: '', contenido: '' }])}
        className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-dark-text/60 transition-colors hover:border-brand-blue hover:text-dark-text"
      >
        + Agregar sección
      </button>
    </div>
  )
}
