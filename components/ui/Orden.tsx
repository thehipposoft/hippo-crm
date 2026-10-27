'use client'

import type { ReactNode } from 'react'
import { useParamsUrl } from './useParamsUrl'
import { ordenarPor, type ColumnaOrden, type Direccion } from '@/lib/orden'

const PARAM_ORDEN = 'orden'
const PARAM_DIR = 'dir'

export type EstadoOrden<K extends string> = { columna: K; direccion: Direccion }

// El orden vive en la URL (?orden=fecha&dir=desc): se mantiene al volver desde
// una ficha y se puede compartir. Se cambia con history.replaceState, que Next
// sincroniza con useSearchParams sin volver a pedir los datos al server.
export const useOrdenTabla = <T, K extends string>(
  columnas: Record<K, ColumnaOrden<T>>,
  inicial: EstadoOrden<NoInfer<K>>
) => {
  const params = useParamsUrl()

  const pedida = params.get(PARAM_ORDEN)
  const esValida = (id: string | null): id is K => id !== null && Object.hasOwn(columnas, id)
  const columna = esValida(pedida) ? pedida : inicial.columna
  const dirPedida = params.get(PARAM_DIR)
  const direccion: Direccion =
    dirPedida === 'asc' || dirPedida === 'desc' ? dirPedida : esValida(pedida) ? columnas[columna].direccionInicial : inicial.direccion

  const cambiarOrden = (id: K) => {
    const nuevaDireccion: Direccion =
      id === columna ? (direccion === 'asc' ? 'desc' : 'asc') : columnas[id].direccionInicial
    params.set({ [PARAM_ORDEN]: id, [PARAM_DIR]: nuevaDireccion })
  }

  const ordenar = (items: readonly T[]): T[] => ordenarPor(items, columnas[columna], direccion)

  return { orden: { columna, direccion }, cambiarOrden, ordenar }
}

const CLASES_TH = 'py-3.5 text-left text-xs font-medium uppercase tracking-wider text-dark-text/50'

// `compacto`: menos padding horizontal, para tablas con muchas columnas
const padding = (compacto?: boolean): string => (compacto ? 'px-3' : 'px-5')

// Encabezado sin orden
export const Th = ({ children, compacto }: { children?: ReactNode; compacto?: boolean }) => (
  <th className={`${padding(compacto)} ${CLASES_TH}`}>{children}</th>
)

interface ThOrdenableProps<K extends string> {
  id: K
  orden: EstadoOrden<K>
  onOrdenar: (id: K) => void
  compacto?: boolean
  children: ReactNode
}

export const ThOrdenable = <K extends string>({ id, orden, onOrdenar, compacto, children }: ThOrdenableProps<K>) => {
  const activo = orden.columna === id
  const ariaSort = activo ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none'

  return (
    <th aria-sort={ariaSort} className={`${padding(compacto)} ${CLASES_TH}`}>
      <button
        type="button"
        onClick={() => onOrdenar(id)}
        className={`group inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-dark-text ${
          activo ? 'text-dark-text' : ''
        }`}
      >
        {children}
        <svg
          className={`h-3 w-3 shrink-0 transition ${activo ? 'text-brand-blue' : 'opacity-0 group-hover:opacity-40'} ${
            activo && orden.direccion === 'asc' ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </th>
  )
}
