'use client'

import { useRef, useState, useTransition, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { archivoSubido, eliminarArchivo, pedirDescargaArchivo, pedirSubidaArchivo } from '@/app/(crm)/proyectos/[id]/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { fechaEnZona } from '@/lib/fechas'
import { formatFechaCorta, formatTamano } from '@/lib/format'
import { TIPOS_ARCHIVO, type ArchivoRow, type TipoArchivo } from '@/lib/types'

const EXTENSIONES = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'key', 'png', 'jpg', 'jpeg']
const ACEPTA = EXTENSIONES.map((e) => `.${e}`).join(',')
// Límite del plugin (WordPress lo vuelve a controlar)
const MAX_MB = 25
const BYTES_POR_MB = 1024 * 1024

interface ArchivosProyectoProps {
  proyectoId: number
  archivos: ArchivoRow[]
}

const labelTipo = (tipo: TipoArchivo): string => TIPOS_ARCHIVO.find((t) => t.value === tipo)?.label ?? tipo

// Sube directo a WordPress con la URL temporal que da el server. Es una subida "simple" a propósito
// (fetch con FormData, sin headers propios ni escuchar el progreso): así el navegador no manda el
// preflight OPTIONS, que el hosting corta sin CORS y bloqueaba la subida.
const subir = async (url: string, archivo: File): Promise<string | null> => {
  const datos = new FormData()
  datos.append('archivo', archivo)
  try {
    const respuesta = await fetch(url, { method: 'POST', body: datos })
    if (respuesta.ok) return null
    const cuerpo = (await respuesta.json().catch(() => null)) as { error?: string } | null
    return cuerpo?.error ?? 'No se pudo subir el archivo.'
  } catch {
    return 'No se pudo conectar con WordPress para subir el archivo. Intentá de nuevo.'
  }
}

const extension = (nombre: string) => nombre.split('.').pop()?.toLowerCase() ?? ''

// Lo que se puede saber antes de pedir permiso a WordPress
const problemaLocal = (archivo: File): string | null => {
  if (!EXTENSIONES.includes(extension(archivo.name))) return 'tipo no permitido (PDF, Word, PowerPoint, Keynote o imagen).'
  if (archivo.size > MAX_MB * BYTES_POR_MB) return `supera los ${MAX_MB} MB.`
  return null
}

type Subida = { actual: number; total: number; nombre: string }

export const ArchivosProyecto = ({ proyectoId, archivos }: ArchivosProyectoProps) => {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [tipo, setTipo] = useState<TipoArchivo>('PROPUESTA')
  const [subida, setSubida] = useState<Subida | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  // Contador de dragenter/dragleave: los hijos de la zona disparan eventos propios
  const capas = useRef(0)
  const subiendo = subida !== null
  const [error, setError] = useState<string | null>(null)
  const [errores, setErrores] = useState<string[]>([])
  const [borrar, setBorrar] = useState<ArchivoRow | null>(null)
  const [pending, startTransition] = useTransition()

  // Sube uno por uno (cada archivo con su permiso); los que fallan se informan al final
  const subirArchivos = async (lista: File[]) => {
    if (lista.length === 0 || subiendo) return
    setError(null)
    setErrores([])
    const fallos: string[] = []
    let subidos = 0
    for (const [i, archivo] of lista.entries()) {
      setSubida({ actual: i + 1, total: lista.length, nombre: archivo.name })
      const local = problemaLocal(archivo)
      if (local) {
        fallos.push(`${archivo.name}: ${local}`)
        continue
      }
      const permiso = await pedirSubidaArchivo(proyectoId, tipo)
      if (permiso.error !== null) {
        fallos.push(`${archivo.name}: ${permiso.error}`)
        continue
      }
      const fallo = archivo.size > permiso.maxMb * BYTES_POR_MB ? `supera los ${permiso.maxMb} MB.` : await subir(permiso.url, archivo)
      if (fallo) fallos.push(`${archivo.name}: ${fallo}`)
      else subidos++
    }
    if (input.current) input.current.value = ''
    setSubida(null)
    setErrores(fallos)
    if (subidos > 0) {
      await archivoSubido(proyectoId)
      router.refresh()
    }
  }

  const alArrastrar = (e: DragEvent<HTMLLabelElement>, entra: boolean) => {
    if (!e.dataTransfer.types.includes('Files')) return
    e.preventDefault()
    capas.current += entra ? 1 : -1
    setArrastrando(capas.current > 0)
  }
  const alSoltar = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    capas.current = 0
    setArrastrando(false)
    subirArchivos(Array.from(e.dataTransfer.files))
  }

  const abrir = (archivo: ArchivoRow) => {
    setError(null)
    // La pestaña se abre ya (si no, el navegador la bloquea) y se completa con el link temporal
    const pestana = window.open('', '_blank')
    startTransition(async () => {
      const resultado = await pedirDescargaArchivo(archivo.id)
      if (resultado.error !== null) {
        pestana?.close()
        setError(resultado.error)
      } else if (pestana) {
        pestana.location.href = resultado.url
      } else {
        window.location.href = resultado.url
      }
    })
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-dark-text/50">Archivos</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-text/50">Subir como</span>
          <select
            aria-label="Tipo de archivo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoArchivo)}
            disabled={subiendo}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            {TIPOS_ARCHIVO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {archivos.length > 0 && (
        <ul className="mb-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {archivos.map((archivo) => {
            const subido = archivo.subidoEl ? fechaEnZona(archivo.subidoEl) : null
            return (
              <li key={archivo.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-white text-[0.625rem] font-semibold uppercase text-dark-text/60">
                    {archivo.nombre.split('.').pop()?.slice(0, 4)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-dark-text">{archivo.nombre}</p>
                    <p className="text-xs text-dark-text/50">
                      {[labelTipo(archivo.tipo), formatTamano(archivo.tamano), subido && formatFechaCorta(subido)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <button type="button" disabled={pending} onClick={() => abrir(archivo)} className="rounded-md px-2 py-1 font-medium text-dark-text/70 hover:bg-brand-blue/10 hover:text-dark-text disabled:opacity-50">
                    Ver
                  </button>
                  <button type="button" onClick={() => setBorrar(archivo)} className="rounded-md px-2 py-1 font-medium text-rose-600 hover:bg-rose-50">
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Zona para arrastrar y soltar (o hacer clic). El input va antes para el foco con teclado */}
      <input
        ref={input}
        type="file"
        multiple
        accept={ACEPTA}
        disabled={subiendo}
        className="peer sr-only"
        id={`subir-${proyectoId}`}
        onChange={(e) => subirArchivos(Array.from(e.target.files ?? []))}
      />
      <label
        htmlFor={`subir-${proyectoId}`}
        onDragEnter={(e) => alArrastrar(e, true)}
        onDragLeave={(e) => alArrastrar(e, false)}
        onDragOver={(e) => e.dataTransfer.types.includes('Files') && e.preventDefault()}
        onDrop={alSoltar}
        aria-disabled={subiendo}
        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 text-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-blue ${
          archivos.length > 0 ? 'py-4' : 'py-8'
        } ${
          arrastrando
            ? 'border-brand-blue bg-brand-blue/10'
            : subiendo
              ? 'pointer-events-none border-slate-200 bg-brand-white'
              : 'cursor-pointer border-slate-200 bg-white hover:border-dark-text/30 hover:bg-brand-white'
        }`}
      >
        {subida ? (
          <>
            <p className="text-sm font-medium text-dark-text">
              Subiendo{subida.total > 1 ? ` ${subida.actual} de ${subida.total}` : ''}…
            </p>
            <p className="max-w-full truncate text-xs text-dark-text/50">{subida.nombre}</p>
            <div role="progressbar" aria-label="Subiendo archivo" className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/3 animate-[subiendo_1.2s_ease-in-out_infinite] rounded-full bg-brand-blue motion-reduce:w-full motion-reduce:animate-pulse" />
            </div>
          </>
        ) : (
          <>
            <svg className={`h-6 w-6 ${arrastrando ? 'text-brand-blue' : 'text-dark-text/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            <p className="text-sm text-dark-text/70">
              {arrastrando ? (
                <span className="font-medium text-dark-text">Soltá para subir como {labelTipo(tipo).toLowerCase()}</span>
              ) : (
                <>
                  <span className="font-medium text-dark-text">Arrastrá archivos acá</span> o hacé clic para elegirlos
                </>
              )}
            </p>
            <p className="text-xs text-dark-text/40">PDF, Word, PowerPoint, Keynote o imagen · Máx. {MAX_MB} MB</p>
          </>
        )}
      </label>

      {(errores.length > 0 || (error && !borrar)) && (
        <div role="alert" className="mt-2 space-y-0.5 text-xs text-rose-600">
          {error && !borrar && <p>{error}</p>}
          {errores.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      <ConfirmDialog
        abierto={borrar !== null}
        titulo={`¿Eliminar ${borrar?.nombre ?? ''}?`}
        mensaje="Se borra el archivo de WordPress. No se puede deshacer."
        textoConfirmar="Eliminar"
        pending={pending}
        error={error}
        onConfirmar={() =>
          borrar &&
          startTransition(async () => {
            const resultado = await eliminarArchivo(proyectoId, borrar.id)
            if (resultado.error) setError(resultado.error)
            else setBorrar(null)
          })
        }
        onCancelar={() => setBorrar(null)}
      />
    </div>
  )
}
