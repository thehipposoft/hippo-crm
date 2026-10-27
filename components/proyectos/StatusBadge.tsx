import type { Estado } from '@/lib/types'

const BADGE: Record<Estado, { label: string; className: string }> = {
  PROSPECTO: {
    label: 'Prospecto',
    className: 'bg-slate-500/10 text-slate-500 ring-1 ring-inset ring-slate-500/20',
  },
  EN_NEGOCIACION: {
    label: 'En negociación',
    className: 'bg-brand-orange/10 text-orange-700 ring-1 ring-inset ring-brand-orange/20',
  },
  ACTIVO: {
    label: 'Activo',
    className: 'bg-brand-green/15 text-lime-700 ring-1 ring-inset ring-brand-green/30',
  },
  EN_PAUSA: {
    label: 'En pausa',
    className: 'bg-slate-400/10 text-slate-500 ring-1 ring-inset ring-slate-400/20',
  },
  CERRADO: {
    label: 'Cerrado',
    className: 'bg-brand-blue/10 text-cyan-700 ring-1 ring-inset ring-brand-blue/20',
  },
  PERDIDO: {
    label: 'Perdido',
    className: 'bg-rose-500/10 text-rose-600 ring-1 ring-inset ring-rose-500/20',
  },
}

interface StatusBadgeProps {
  estado: Estado
}

export const StatusBadge = ({ estado }: StatusBadgeProps) => {
  const { label, className } = BADGE[estado]
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
