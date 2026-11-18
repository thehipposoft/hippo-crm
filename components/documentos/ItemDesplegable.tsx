'use client'

import { useId, useState, type ReactNode } from 'react'

interface ItemDesplegableProps {
  // Fila visible (descripción, plazo, importe): solo contenido de línea, va dentro de un botón
  fila: ReactNode
  detalle: string
}

// Ítem de la inversión que se abre con transición (alto + fundido); sin animación si el usuario
// pidió movimiento reducido
export const ItemDesplegable = ({ fila, detalle }: ItemDesplegableProps) => {
  const [abierto, setAbierto] = useState(false)
  const id = useId()

  return (
    <li>
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((a) => !a)}
        className="group flex w-full cursor-pointer items-start gap-4 py-4 text-left"
      >
        {fila}
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-dark-text transition-[transform,background-color] duration-300 ease-out motion-reduce:transition-none ${
            abierto ? 'rotate-45 bg-brand-green' : 'bg-brand-green/40 group-hover:bg-brand-green/70'
          }`}
          aria-hidden
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <div
        id={id}
        inert={!abierto}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          abierto ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p
            className={`mb-4 whitespace-pre-line rounded-xl bg-brand-white p-4 text-sm leading-relaxed text-dark-text/75 transition-transform duration-300 ease-out motion-reduce:transition-none ${
              abierto ? 'translate-y-0' : '-translate-y-2'
            }`}
          >
            {detalle}
          </p>
        </div>
      </div>
    </li>
  )
}
