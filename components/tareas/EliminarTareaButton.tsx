'use client'

import { useState, useTransition } from 'react'
import { eliminarTarea } from '@/app/(crm)/tareas/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export const EliminarTareaButton = ({ tareaId, titulo }: { tareaId: number; titulo: string }) => {
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-sm font-medium text-rose-600 hover:underline"
      >
        Eliminar tarea
      </button>
      <ConfirmDialog
        abierto={abierto}
        titulo="¿Eliminar esta tarea?"
        mensaje={`"${titulo}" se borra del tablero. Si ya está resuelta, mejor marcala como hecha.`}
        textoConfirmar="Eliminar"
        pending={pending}
        error={error}
        onConfirmar={() =>
          startTransition(async () => {
            const resultado = await eliminarTarea(tareaId)
            if (resultado.error) setError(resultado.error)
          })
        }
        onCancelar={() => setAbierto(false)}
      />
    </>
  )
}
