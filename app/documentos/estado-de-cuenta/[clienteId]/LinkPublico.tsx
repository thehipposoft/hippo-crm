'use client'

import { useState, useTransition } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cambiarLinkPublico } from './actions'

const MS_COPIADO = 2000

interface LinkPublicoProps {
  clienteId: number
  url: string | null
}

// Link secreto para que el cliente vea su estado de cuenta sin usuario
export const LinkPublico = ({ clienteId, url }: LinkPublicoProps) => {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [confirmar, setConfirmar] = useState<'crear' | 'desactivar' | null>(null)

  const ejecutar = (accion: 'crear' | 'desactivar') => {
    setError(null)
    startTransition(async () => {
      const resultado = await cambiarLinkPublico(clienteId, accion)
      if (resultado.error) setError(resultado.error)
      setConfirmar(null)
    })
  }

  const copiar = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), MS_COPIADO)
  }

  return (
    <section className="mx-auto mb-4 w-full max-w-[210mm] rounded-xl border border-slate-200 bg-white px-5 py-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-dark-text">Link para el cliente</h2>
          <p className="text-xs text-dark-text/50">
            {url
              ? 'Cualquiera con este link ve este estado de cuenta y sus recibos (sin notas internas).'
              : 'Creá un link para que el cliente vea su estado de cuenta online, siempre actualizado.'}
          </p>
        </div>
        {!url && (
          <button
            type="button"
            onClick={() => ejecutar('crear')}
            disabled={pending}
            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white transition hover:brightness-95 disabled:opacity-50"
          >
            {pending ? 'Creando...' : 'Crear link'}
          </button>
        )}
      </div>

      {url && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            readOnly
            value={url}
            aria-label="Link público"
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-brand-white px-3 py-2 text-xs text-dark-text/70"
          />
          <button
            type="button"
            onClick={copiar}
            className="rounded-lg bg-brand-blue px-3.5 py-2 text-xs font-medium text-white transition hover:brightness-95"
          >
            {copiado ? '¡Copiado!' : 'Copiar'}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-dark-text transition-colors hover:bg-slate-50"
          >
            Abrir
          </a>
          <button
            type="button"
            onClick={() => setConfirmar('crear')}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-dark-text transition-colors hover:bg-slate-50"
          >
            Nuevo link
          </button>
          <button
            type="button"
            onClick={() => setConfirmar('desactivar')}
            className="rounded-lg border border-rose-200 px-3.5 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            Desactivar
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-rose-600">
          {error}
        </p>
      )}

      <ConfirmDialog
        abierto={confirmar !== null}
        titulo={confirmar === 'crear' ? '¿Generar un link nuevo?' : '¿Desactivar el link?'}
        mensaje={
          confirmar === 'crear'
            ? 'El link actual deja de funcionar. Vas a tener que mandarle el nuevo al cliente.'
            : 'El cliente ya no va a poder ver su estado de cuenta con el link que tiene.'
        }
        textoConfirmar={confirmar === 'crear' ? 'Generar nuevo' : 'Desactivar'}
        pending={pending}
        error={error}
        onConfirmar={() => confirmar && ejecutar(confirmar)}
        onCancelar={() => setConfirmar(null)}
      />
    </section>
  )
}
