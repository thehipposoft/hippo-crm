import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  // string o un nodo (link, badge)
  value: ReactNode
}

// Fila label / valor de las fichas de detalle
export const Field = ({ label, value }: FieldProps) => (
  <div className="flex items-center justify-between gap-4 px-5 py-4">
    <span className="text-xs font-medium uppercase tracking-wider text-dark-text/50">{label}</span>
    <span className="text-right text-sm text-dark-text/80">{value}</span>
  </div>
)
