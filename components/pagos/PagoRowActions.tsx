'use client'

import { eliminarPago } from '@/app/(crm)/pagos/[id]/actions'
import { RowActions } from '@/components/ui/RowActions'

interface PagoRowActionsProps {
  pagoId: number
}

export const PagoRowActions = ({ pagoId }: PagoRowActionsProps) => (
  <RowActions
    verHref={`/pagos/${pagoId}`}
    editarHref={`/pagos/${pagoId}/editar`}
    eliminar={{
      titulo: '¿Eliminar este pago?',
      mensaje: 'Va a la papelera de WordPress: desde la app no se puede deshacer.',
      accion: () => eliminarPago(pagoId),
    }}
  />
)
