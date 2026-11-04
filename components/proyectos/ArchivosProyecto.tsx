'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { archivoSubido, eliminarArchivo, pedirDescargaArchivo, pedirSubidaArchivo } from '@/app/(crm)/proyectos/[id]/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { fechaEnZona } from '@/lib/fechas'
import { formatFechaCorta, formatTamano } from '@/lib/format'
import { TIPOS_ARCHIVO, type ArchivoRow, type TipoArchivo } from '@/lib/types'

const ACEPTA = '.pdf,.doc,.docx,.ppt,.pptx,.key,.png,.jpg,.jpeg'
const PORCENTAJE = 100
const BYTES_POR_MB = 1024 * 1024

interface ArchivosProyectoProps {
  proyectoId: number
  archivos: ArchivoRow[]
}

const labelTipo = (tipo: TipoArchivo): string => TIPOS_ARCHIVO.find((t) => t.value === tipo)?.label ?? tipo

// Sube directo a WordPress con XHR (para mostrar el progreso), con la URL temporal que da el server
const subir = (url: string, archivo: File, alProgreso: (porcentaje: number) => void): Promise<string | null> =>
  new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    const datos = new FormData()
    datos.append('archivo', archivo)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) alProgreso(Math.round((e.loaded / e.total) * PORCENTAJE))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve(null)
      try {
        resolve((JSON.parse(xhr.responseText) as { error?: string }).error ?? 'No se pudo subir el archivo.')
      } catch {
        resolve('No se pudo subir el archivo.')
      }
    }
    xhr.onerror = () => resolve('Se cortó la conexión con WordPress. Intentá de nuevo.')
    xhr.open('POST', url)
    xhr.send(datos)
  })

export const ArchivosProyecto = ({ proyectoId, archivos }: ArchivosProyectoProps) => {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [tipo, setTipo] = useState<TipoArchivo>('PROPUESTA')
  const [progreso, setProgreso] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [borrar, setBorrar] = useState<ArchivoRow | null>(null)
  const [pending, startTransition] = useTransition()

  const alElegir = async (archivo: File | undefined) => {
    if (!archivo) return
    setError(null)
    setProgreso(0)
    const permiso = await pedirSubidaArchivo(proyectoId, tipo)
    if (permiso.error !== null) {
      setError(permiso.error)
      setProgreso(null)
      return
    }
    if (archivo.size > permiso.maxMb * BYTES_POR_MB) {
      setError(`El archivo supera los ${permiso.maxMb} MB.`)
      setProgreso(null)
      return
    }
    const fallo = await subir(permiso.url, archivo, setProgreso)
    if (input.current) input.current.value = ''
    setProgreso(null)
    if (fallo) return setError(fallo)
    await archivoSubido(proyectoId)
    router.refresh()
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
          <select
            aria-label="Tipo de archivo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoArchivo)}
            disabled={progreso !== null}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            {TIPOS_ARCHIVO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input ref={input} type="file" accept={ACEPTA} className="sr-only" id={`subir-${proyectoId}`} onChange={(e) => alElegir(e.target.files?.[0])} />
          <label
            htmlFor={`subir-${proyectoId}`}
            aria-disabled={progreso !== null}
            className={`cursor-pointer rounded-lg bg-dark-text px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-dark-text/85 ${
              progreso !== null ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            {progreso !== null ? `Subiendo ${progreso}%` : 'Subir archivo'}
          </label>
        </div>
      </div>

      {progreso !== null && (
        <progress
          value={progreso}
          max={PORCENTAJE}
          aria-label="Progreso de la subida"
          className="mb-3 block h-1.5 w-full appearance-none overflow-hidden rounded-full [&::-moz-progress-bar]:bg-brand-blue [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-brand-blue"
        />
      )}

      {archivos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-dark-text/40">
          Subí la propuesta en PDF (u otro documento del proyecto). Máx. 25 MB.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
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

      {error && !borrar && (
        <p role="alert" className="mt-2 text-xs text-rose-600">
          {error}
        </p>
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
