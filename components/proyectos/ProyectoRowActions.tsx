'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cambiarEstadoProyecto } from '@/app/(crm)/proyectos/[id]/actions'
import { CLASES_ITEM_MENU, ItemMenu, RowActions } from '@/components/ui/RowActions'
import { ESTADOS, type Estado } from '@/lib/types'

const ICONO_PAGO = 'M12 4v16m8-8H4'

interface ProyectoRowActionsProps {
  proyectoId: number
  estado: Estado
}

export const ProyectoRowActions = ({ proyectoId, estado }: ProyectoRowActionsProps) => {
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const cambiarEstado = (nuevo: Estado) => {
    setError(null)
    startTransition(async () => {
      const resultado = await cambiarEstadoProyecto(proyectoId, nuevo)
      if (resultado.error) setError(resultado.error)
    })
  }

  return (
    <div className={`flex items-center justify-end gap-2 ${pending ? 'opacity-50' : ''}`}>
      {error && (
        <span role="alert" className="text-xs text-rose-600">
          {error}
        </span>
      )}
      <RowActions
        verHref={`/proyectos/${proyectoId}`}
        editarHref={`/proyectos/${proyectoId}/editar`}
        extra={(cerrar) => (
          <>
            <Link
              href={`/pagos/nuevo?proyecto=${proyectoId}&volver=${pathname}`}
              onClick={cerrar}
              role="menuitem"
              className={CLASES_ITEM_MENU}
            >
              <ItemMenu icono={ICONO_PAGO}>Registrar pago</ItemMenu>
            </Link>
            <div className="my-1 border-t border-slate-200" />
            <p className="px-3.5 pb-1 pt-1.5 text-xs font-medium uppercase tracking-wider text-dark-text/40">
              Cambiar estado
            </p>
            {ESTADOS.filter((e) => e.value !== estado).map((e) => (
              <button
                key={e.value}
                type="button"
                role="menuitem"
                disabled={pending}
                onClick={() => {
                  cerrar()
                  cambiarEstado(e.value)
                }}
                className={`${CLASES_ITEM_MENU} pl-6`}
              >
                {e.label}
              </button>
            ))}
          </>
        )}
      />
    </div>
  )
}
