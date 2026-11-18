'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ModalRespuestaProps {
  abierto: boolean
  etiquetaCerrar: string
  onCerrar: () => void
  children: ReactNode
}

// Modal nativo (<dialog>) para aceptar / rechazar sin tener que bajar hasta el final de la propuesta.
// Escape o click en el fondo cierran.
export const ModalRespuesta = ({ abierto, etiquetaCerrar, onCerrar, children }: ModalRespuestaProps) => {
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
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-white p-0 text-dark-text shadow-2xl backdrop:bg-dark-text/50 backdrop:backdrop-blur-sm"
    >
      <div className="relative">
        <button
          type="button"
          onClick={onCerrar}
          aria-label={etiquetaCerrar}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-dark-text/50 transition-colors hover:bg-slate-100 hover:text-dark-text"
        >
          ×
        </button>
        {/* Se monta solo abierto: cada vez arranca de cero (sin una acción a medio elegir) */}
        {abierto && children}
      </div>
    </dialog>
  )
}
