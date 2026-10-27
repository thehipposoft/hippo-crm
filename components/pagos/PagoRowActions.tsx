'use client'

import { eliminarPago } from '@/app/(crm)/pagos/[id]/actions'
import Link from 'next/link'
import { CLASES_ITEM_MENU, ItemMenu, RowActions } from '@/components/ui/RowActions'

const ICONO_RECIBO =
  'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'

interface PagoRowActionsProps {
  pagoId: number
}

export const PagoRowActions = ({ pagoId }: PagoRowActionsProps) => (
  <RowActions
    verHref={`/pagos/${pagoId}`}
    editarHref={`/pagos/${pagoId}/editar`}
    extra={(cerrar) => (
      <Link href={`/documentos/recibo/${pagoId}`} onClick={cerrar} role="menuitem" className={CLASES_ITEM_MENU}>
        <ItemMenu icono={ICONO_RECIBO}>Ver recibo</ItemMenu>
      </Link>
    )}
    eliminar={{
      titulo: '¿Eliminar este pago?',
      mensaje: 'Va a la papelera de WordPress: desde la app no se puede deshacer.',
      accion: () => eliminarPago(pagoId),
    }}
  />
)
