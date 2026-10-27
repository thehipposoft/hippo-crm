'use client'

import { useEffect, useRef, useState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { ConfirmDialog } from './ConfirmDialog'

const ANCHO_MENU_PX = 192
const ALTO_MENU_ESTIMADO_PX = 260
const SEPARACION_PX = 4

type Posicion = { top: number; left: number }

export type AccionEliminar = {
  titulo: string
  mensaje: string
  accion: () => Promise<{ error: string | null }>
}

interface RowActionsProps {
  verHref: string
  editarHref: string
  eliminar?: AccionEliminar
  // Ítems extra; reciben `cerrar` para cerrar el menú al elegir
  extra?: (cerrar: () => void) => ReactNode
}

const ICONO_VER =
  'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
const ICONO_EDITAR =
  'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
const ICONO_ELIMINAR =
  'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'

export const ItemMenu = ({ icono, children }: { icono: string; children: ReactNode }) => (
  <>
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icono} />
    </svg>
    {children}
  </>
)

export const CLASES_ITEM_MENU =
  'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-dark-text/70 transition-colors hover:bg-brand-blue/10 hover:text-dark-text'

// Menú "⋮" de las filas. Se posiciona `fixed` para que no lo corte el scroll
// horizontal de la tabla ni la última fila.
export const RowActions = ({ verHref, editarHref, eliminar, extra }: RowActionsProps) => {
  const [posicion, setPosicion] = useState<Posicion | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const botonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const cerrar = () => setPosicion(null)

  const abrir = () => {
    const rect = botonRef.current?.getBoundingClientRect()
    if (!rect) return
    const entraAbajo = rect.bottom + ALTO_MENU_ESTIMADO_PX < window.innerHeight
    setPosicion({
      top: entraAbajo ? rect.bottom + SEPARACION_PX : Math.max(SEPARACION_PX, rect.top - ALTO_MENU_ESTIMADO_PX),
      left: Math.max(SEPARACION_PX, rect.right - ANCHO_MENU_PX),
    })
  }

  useEffect(() => {
    if (!posicion) return
    const alClickAfuera = (e: MouseEvent) => {
      const objetivo = e.target as Node
      if (!menuRef.current?.contains(objetivo) && !botonRef.current?.contains(objetivo)) cerrar()
    }
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cerrar()
        botonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', alClickAfuera)
    document.addEventListener('keydown', alTeclado)
    window.addEventListener('scroll', cerrar, true)
    window.addEventListener('resize', cerrar)
    return () => {
      document.removeEventListener('mousedown', alClickAfuera)
      document.removeEventListener('keydown', alTeclado)
      window.removeEventListener('scroll', cerrar, true)
      window.removeEventListener('resize', cerrar)
    }
  }, [posicion])

  const confirmarEliminar = () => {
    if (!eliminar) return
    setError(null)
    startTransition(async () => {
      const resultado = await eliminar.accion()
      if (resultado.error) setError(resultado.error)
      else setConfirmando(false)
    })
  }

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        onClick={() => (posicion ? cerrar() : abrir())}
        aria-label="Acciones"
        aria-haspopup="menu"
        aria-expanded={posicion !== null}
        className="flex h-8 w-8 items-center justify-center rounded-md text-dark-text/40 transition-colors hover:bg-slate-100 hover:text-dark-text"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
        </svg>
      </button>

      {posicion && (
        <div
          ref={menuRef}
          role="menu"
          // Única excepción a "sin estilos inline": coordenadas calculadas en runtime
          style={{ top: posicion.top, left: posicion.left }}
          className="fixed z-50 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10"
        >
          <Link href={verHref} onClick={cerrar} role="menuitem" className={CLASES_ITEM_MENU}>
            <ItemMenu icono={ICONO_VER}>Ver detalle</ItemMenu>
          </Link>
          <Link href={editarHref} onClick={cerrar} role="menuitem" className={CLASES_ITEM_MENU}>
            <ItemMenu icono={ICONO_EDITAR}>Editar</ItemMenu>
          </Link>

          {extra?.(cerrar)}

          {eliminar && (
            <>
              <div className="my-1 border-t border-slate-200" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  cerrar()
                  setError(null)
                  setConfirmando(true)
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50"
              >
                <ItemMenu icono={ICONO_ELIMINAR}>Eliminar</ItemMenu>
              </button>
            </>
          )}
        </div>
      )}

      {eliminar && (
        <ConfirmDialog
          abierto={confirmando}
          titulo={eliminar.titulo}
          mensaje={eliminar.mensaje}
          textoConfirmar="Eliminar"
          pending={pending}
          error={error}
          onConfirmar={confirmarEliminar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </>
  )
}
