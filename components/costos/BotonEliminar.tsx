'use client'

import { useState, useTransition } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface BotonEliminarProps {
  // Server action ya ligada a sus ids
  accion: () => Promise<{ error: string | null }>
  titulo: string
  mensaje: string
  texto?: string
  compacto?: boolean
}

export const BotonEliminar = ({ accion, titulo, mensaje, texto = 'Eliminar', compacto = false }: BotonEliminarProps) => {
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const confirmar = () => {
    setError(null)
    startTransition(async () => {
      const resultado = await accion()
      if (resultado.error) setError(resultado.error)
      else setAbierto(false)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={
          compacto
            ? 'rounded-md px-2 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50'
            : 'rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50'
        }
      >
        {texto}
      </button>
      <ConfirmDialog
        abierto={abierto}
        titulo={titulo}
        mensaje={mensaje}
        textoConfirmar="Eliminar"
        pending={pending}
        error={error}
        onConfirmar={confirmar}
        onCancelar={() => setAbierto(false)}
      />
    </>
  )
}
