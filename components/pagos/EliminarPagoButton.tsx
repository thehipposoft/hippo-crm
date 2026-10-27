'use client'

import { useState, useTransition } from 'react'
import { eliminarPago } from '@/app/(crm)/pagos/[id]/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface EliminarPagoButtonProps {
  pagoId: number
}

export const EliminarPagoButton = ({ pagoId }: EliminarPagoButtonProps) => {
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const confirmar = () => {
    setError(null)
    startTransition(async () => {
      const resultado = await eliminarPago(pagoId, '/pagos')
      if (resultado.error) setError(resultado.error)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
      >
        Eliminar
      </button>
      <ConfirmDialog
        abierto={abierto}
        titulo="¿Eliminar este pago?"
        mensaje="Va a la papelera de WordPress: desde la app no se puede deshacer."
        textoConfirmar="Eliminar"
        pending={pending}
        error={error}
        onConfirmar={confirmar}
        onCancelar={() => setAbierto(false)}
      />
    </>
  )
}
