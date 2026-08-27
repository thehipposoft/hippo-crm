'use client'

import { useState, useTransition } from 'react'
import { eliminarPago } from '@/app/(crm)/pagos/[id]/actions'

interface EliminarPagoButtonProps {
  pagoId: number
}

export const EliminarPagoButton = ({ pagoId }: EliminarPagoButtonProps) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    if (!window.confirm('¿Eliminar este pago? Esta acción no se puede deshacer desde la app.')) return

    startTransition(async () => {
      const result = await eliminarPago(pagoId)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-lg border border-rose-200 bg-white hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-rose-600 transition-colors"
      >
        {isPending ? 'Eliminando...' : 'Eliminar'}
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}
