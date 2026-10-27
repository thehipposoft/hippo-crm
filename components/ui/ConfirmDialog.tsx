'use client'

import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  abierto: boolean
  titulo: string
  mensaje: string
  textoConfirmar: string
  pending?: boolean
  error?: string | null
  onConfirmar: () => void
  onCancelar: () => void
}

// Modal nativo (<dialog>): foco atrapado, Escape cierra y queda encima de todo.
export const ConfirmDialog = ({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  pending = false,
  error,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (abierto && !dialog.open) dialog.showModal()
    if (!abierto && dialog.open) dialog.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        if (!pending) onCancelar()
      }}
      onClick={(e) => {
        // Click en el fondo (fuera del contenido) cierra
        if (e.target === e.currentTarget && !pending) onCancelar()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl bg-white p-0 text-dark-text shadow-2xl backdrop:bg-dark-text/40"
    >
      <div className="p-5">
        <h2 className="text-base font-semibold">{titulo}</h2>
        <p className="mt-2 text-sm text-dark-text/70">{mensaje}</p>
        {error && (
          <p role="alert" className="mt-3 text-xs text-rose-600">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={pending}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={pending}
            autoFocus
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  )
}
