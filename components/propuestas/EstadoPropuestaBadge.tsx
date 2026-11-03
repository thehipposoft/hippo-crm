import { labelEstadoPropuesta, type EstadoVisible } from '@/lib/propuestas'

const COLORES: Record<EstadoVisible, string> = {
  BORRADOR: 'bg-slate-100 text-dark-text/60 ring-slate-200',
  ENVIADA: 'bg-brand-blue/10 text-cyan-800 ring-brand-blue/30',
  ACEPTADA: 'bg-brand-forest/10 text-brand-forest ring-brand-forest/25',
  RECHAZADA: 'bg-rose-50 text-rose-700 ring-rose-200',
  VENCIDA: 'bg-brand-orange/10 text-orange-800 ring-brand-orange/30',
}

export const EstadoPropuestaBadge = ({ estado, vista = false }: { estado: EstadoVisible; vista?: boolean }) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${COLORES[estado]}`}>{labelEstadoPropuesta(estado)}</span>
    {vista && estado === 'ENVIADA' && <span className="text-xs text-dark-text/50">· vista</span>}
  </span>
)
