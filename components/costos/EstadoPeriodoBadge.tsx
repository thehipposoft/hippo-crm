import { formatMonto } from '@/lib/format'
import type { ResumenPeriodo } from '@/lib/costos'
import type { Moneda } from '@/lib/types'

interface EstadoPeriodoBadgeProps {
  resumen: ResumenPeriodo
  moneda: Moneda
}

export const EstadoPeriodoBadge = ({ resumen, moneda }: EstadoPeriodoBadgeProps) => {
  const clases = 'inline-flex self-start items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'
  if (resumen.estado === 'PAGADO') return <span className={`${clases} bg-emerald-50 text-emerald-700 ring-emerald-200`}>Pagado</span>
  if (resumen.estado === 'PARCIAL') {
    return <span className={`${clases} bg-amber-50 text-amber-700 ring-amber-200`}>Falta {formatMonto(resumen.falta, moneda)}</span>
  }
  return <span className={`${clases} bg-rose-50 text-rose-700 ring-rose-200`}>Pendiente</span>
}
