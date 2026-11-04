'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import {
  cambiarEstadoPropuesta,
  duplicarPropuesta,
  eliminarPropuesta,
  guardarComoPlantilla,
} from '@/app/(crm)/propuestas/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CLASES_CONTROL } from '@/components/ui/Formulario'
import { rutaPublicaPropuesta } from '@/lib/propuestas'
import type { EstadoPropuesta, PropuestaRow } from '@/lib/types'

const MS_COPIADO = 2000
// Si después de cambiar el estado la ficha no se actualizó en este tiempo, se recarga la página
const MS_ESPERA_REFRESCO = 2500

const BOTON = 'rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-dark-text transition-colors hover:bg-brand-blue/10 disabled:opacity-50'

// El origen solo existe en el navegador (en el server queda vacío)
const subscribe = () => () => {}
const useOrigen = () => useSyncExternalStore(subscribe, () => window.location.origin, () => '')

interface AccionesPropuestaProps {
  propuesta: Pick<PropuestaRow, 'id' | 'estado' | 'token' | 'titulo' | 'tipo'>
}

export const AccionesPropuesta = ({ propuesta }: AccionesPropuestaProps) => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const [nombrePlantilla, setNombrePlantilla] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const origen = useOrigen()
  const etiqueta = propuesta.tipo === 'PROPUESTA' ? 'propuesta' : 'cotización'
  const [estadoEsperado, setEstadoEsperado] = useState<EstadoPropuesta | null>(null)

  // Next a veces no aplica la revalidación de la acción (pasa ~1 de cada 8 veces en las pruebas):
  // si el estado nuevo no llega, se recarga la página para no mostrar datos viejos.
  useEffect(() => {
    if (!estadoEsperado || propuesta.estado === estadoEsperado) return
    const timer = setTimeout(() => window.location.reload(), MS_ESPERA_REFRESCO)
    return () => clearTimeout(timer)
  }, [estadoEsperado, propuesta.estado])

  // Sin useTransition: si la revalidación no llega, la transición queda pendiente y traba los botones
  const ejecutar = async (accion: () => Promise<{ error: string | null }>, alTerminar?: () => void) => {
    setError(null)
    setPending(true)
    try {
      const resultado = await accion()
      if (resultado.error) return setError(resultado.error)
      alTerminar?.()
      router.refresh()
    } finally {
      setPending(false)
    }
  }
  const cambiarEstado = (estado: EstadoPropuesta) =>
    ejecutar(
      () => cambiarEstadoPropuesta(propuesta.id, estado),
      () => setEstadoEsperado(estado)
    )

  const url = propuesta.token ? `${origen}${rutaPublicaPropuesta(propuesta.token)}` : null
  const copiar = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), MS_COPIADO)
  }

  return (
    <div className="space-y-4">
      {propuesta.estado === 'BORRADOR' ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
          <p className="text-sm font-medium text-dark-text">Es un borrador: el cliente todavía no la puede ver.</p>
          <p className="mt-0.5 text-xs text-dark-text/50">Al marcarla como enviada se activa el link para que la vea, la descargue y la acepte o rechace.</p>
          <button
            type="button"
            disabled={pending}
            onClick={() => cambiarEstado('ENVIADA')}
            className="mt-4 rounded-lg bg-dark-text px-4 py-2 text-sm font-medium text-white transition hover:bg-dark-text/85 disabled:opacity-50"
          >
            Marcar como enviada y activar link
          </button>
        </div>
      ) : (
        url && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <label htmlFor="link-publico" className="text-xs font-medium uppercase tracking-wider text-dark-text/50">
              Link para el cliente
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input id="link-publico" readOnly value={url} onFocus={(e) => e.currentTarget.select()} className={`${CLASES_CONTROL} min-w-0 flex-1 font-mono text-xs`} />
              <button type="button" onClick={copiar} className="rounded-lg bg-dark-text px-4 py-2 text-sm font-medium text-white transition hover:bg-dark-text/85">
                {copiado ? '¡Copiado!' : 'Copiar'}
              </button>
              <a href={url} target="_blank" rel="noopener noreferrer" className={BOTON}>
                Abrir
              </a>
            </div>
            <p className="mt-2 text-xs text-dark-text/50">Si lo abrís con tu sesión del CRM no cuenta como &ldquo;vista&rdquo; por el cliente.</p>
          </div>
        )
      )}

      <div className="flex flex-wrap items-center gap-2">
        {propuesta.estado === 'ENVIADA' && (
          <>
            <button type="button" disabled={pending} onClick={() => cambiarEstado('ACEPTADA')} className={BOTON}>
              Marcar aceptada
            </button>
            <button type="button" disabled={pending} onClick={() => cambiarEstado('RECHAZADA')} className={BOTON}>
              Marcar rechazada
            </button>
            <button type="button" disabled={pending} onClick={() => cambiarEstado('BORRADOR')} className={BOTON}>
              Volver a borrador
            </button>
          </>
        )}
        {(propuesta.estado === 'ACEPTADA' || propuesta.estado === 'RECHAZADA') && (
          <button type="button" disabled={pending} onClick={() => cambiarEstado('ENVIADA')} className={BOTON} title="Borra la respuesta y el cliente puede volver a responder">
            Reabrir
          </button>
        )}
        <button type="button" disabled={pending} onClick={() => ejecutar(() => duplicarPropuesta(propuesta.id))} className={BOTON}>
          Duplicar
        </button>
        <button type="button" disabled={pending} onClick={() => setNombrePlantilla(propuesta.titulo)} className={BOTON}>
          Guardar como plantilla
        </button>
        <button
          type="button"
          onClick={() => setConfirmarBorrado(true)}
          className="rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
        >
          Eliminar
        </button>
      </div>

      {nombrePlantilla !== null && (
        <form
          className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault()
            ejecutar(() => guardarComoPlantilla(propuesta.id, nombrePlantilla))
          }}
        >
          <div className="min-w-56 flex-1">
            <label htmlFor="nombre-plantilla" className="mb-1.5 block text-xs font-medium text-dark-text/60">
              Nombre de la plantilla
            </label>
            <input id="nombre-plantilla" autoFocus value={nombrePlantilla} onChange={(e) => setNombrePlantilla(e.target.value)} className={CLASES_CONTROL} />
          </div>
          <button type="submit" disabled={pending} className="rounded-lg bg-dark-text px-4 py-2.5 text-sm font-medium text-white transition hover:bg-dark-text/85 disabled:opacity-50">
            Guardar
          </button>
          <button type="button" onClick={() => setNombrePlantilla(null)} className="px-2 py-2.5 text-sm text-dark-text/60 hover:text-dark-text">
            Cancelar
          </button>
        </form>
      )}

      {error && !confirmarBorrado && (
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      )}

      <ConfirmDialog
        abierto={confirmarBorrado}
        titulo={`¿Eliminar esta ${etiqueta}?`}
        mensaje="Va a la papelera de WordPress y el link del cliente deja de funcionar."
        textoConfirmar="Eliminar"
        pending={pending}
        error={error}
        onConfirmar={() => ejecutar(() => eliminarPropuesta(propuesta.id))}
        onCancelar={() => setConfirmarBorrado(false)}
      />
    </div>
  )
}
