'use client'

export const ICONOS = {
  subir: 'M5 15l7-7 7 7',
  bajar: 'M19 9l-7 7-7-7',
  quitar: 'M6 18L18 6M6 6l12 12',
} as const

interface BotonIconoProps {
  label: string
  icono: string
  onClick: () => void
  disabled?: boolean
  peligro?: boolean
}

export const BotonIcono = ({ label, icono, onClick, disabled = false, peligro = false }: BotonIconoProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className={`flex h-7 w-7 items-center justify-center rounded-md text-dark-text/40 transition-colors disabled:opacity-30 ${
      peligro ? 'hover:bg-rose-50 hover:text-rose-600' : 'hover:bg-slate-100 hover:text-dark-text'
    }`}
  >
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={icono} />
    </svg>
  </button>
)
