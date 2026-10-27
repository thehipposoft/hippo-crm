import { formatMonto } from '@/lib/format'
import { saldoProyecto, type ResumenPendiente } from '@/lib/proyectos'

interface SaldoProyectoProps {
  resumen: ResumenPendiente
}

// Pendiente en el color normal; al día y saldo a favor en verde
export const SaldoProyecto = ({ resumen }: SaldoProyectoProps) => {
  const saldo = saldoProyecto(resumen)

  switch (saldo.tipo) {
    case 'PENDIENTE':
      return <span>{formatMonto(saldo.monto, resumen.moneda)}</span>
    case 'AL_DIA':
      return <span className="font-medium text-emerald-600">Al día</span>
    case 'A_FAVOR':
      return (
        <span className="text-emerald-600">
          <span className="font-medium">{formatMonto(saldo.monto, resumen.moneda)}</span> a favor
        </span>
      )
  }
}
