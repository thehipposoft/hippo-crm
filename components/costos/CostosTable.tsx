'use client'

import Link from 'next/link'
import { FRECUENCIA_VALUES, FRECUENCIAS_PAGO, type CostoRow } from '@/lib/types'
import { ContenedorTabla, FilaTabla } from '@/components/ui/FilaTabla'
import { RowActions } from '@/components/ui/RowActions'
import { formatFecha, formatMonto } from '@/lib/format'
import { costoVigenteEn } from '@/lib/analytics'
import { ThOrdenable, useOrdenTabla } from '@/components/ui/Orden'
import { claveFecha, type ColumnaOrden } from '@/lib/orden'

const labelFrecuencia = (frecuencia: CostoRow['frecuencia']): string =>
  FRECUENCIAS_PAGO.find((f) => f.value === frecuencia)?.label ?? frecuencia

const COLUMNAS = {
  nombre: { valor: (c) => c.nombreCosto, direccionInicial: 'asc' },
  monto: { valor: (c) => [c.moneda, c.monto], direccionInicial: 'desc' },
  frecuencia: { valor: (c) => FRECUENCIA_VALUES.indexOf(c.frecuencia), direccionInicial: 'asc' },
  metodo: { valor: (c) => c.metodoPago, direccionInicial: 'asc' },
  renovacion: { valor: (c) => claveFecha(c.fechaRenovacion), direccionInicial: 'asc' },
} satisfies Record<string, ColumnaOrden<CostoRow>>

interface CostosTableProps {
  costos: CostoRow[]
}

export const CostosTable = ({ costos }: CostosTableProps) => {
  const { orden, cambiarOrden, ordenar } = useOrdenTabla(COLUMNAS, { columna: 'nombre', direccion: 'asc' })
  const filas = ordenar(costos)
  const thProps = { orden, onOrdenar: cambiarOrden }

  return (
    <ContenedorTabla>
      <table className="w-full min-w-3xl text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-brand-white">
            <ThOrdenable id="nombre" {...thProps}>Nombre del costo</ThOrdenable>
            <ThOrdenable id="monto" {...thProps}>Monto</ThOrdenable>
            <ThOrdenable id="frecuencia" {...thProps}>Frecuencia</ThOrdenable>
            <ThOrdenable id="metodo" {...thProps}>Método de pago</ThOrdenable>
            <ThOrdenable id="renovacion" {...thProps}>Fecha de renovación</ThOrdenable>
            <th className="px-3 py-3.5 w-12" />
          </tr>
        </thead>
        <tbody>
          {costos.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-14 text-center text-sm text-dark-text/40">
                No hay costos registrados todavía.
              </td>
            </tr>
          ) : (
            filas.map((costo) => {
              const vigente = costoVigenteEn(costo)
              return (
              <FilaTabla key={costo.id} href={`/costos/${costo.id}`} className={vigente ? '' : 'opacity-50'}>
                <td className="px-5 py-4">
                  <Link href={`/costos/${costo.id}`} className="font-medium text-dark-text hover:text-brand-blue">
                    {costo.nombreCosto}
                  </Link>
                  {!vigente && (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-dark-text/60">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-dark-text tabular-nums">
                  {formatMonto(costo.monto, costo.moneda)}
                </td>
                <td className="px-5 py-4 text-dark-text/60">
                  {labelFrecuencia(costo.frecuencia)}
                </td>
                <td className="px-5 py-4 text-dark-text/60">
                  {costo.metodoPago ?? '—'}
                </td>
                <td className="px-5 py-4 text-dark-text/60 tabular-nums">
                  {formatFecha(costo.fechaRenovacion)}
                </td>
                <td className="px-3 py-4" data-sin-navegar>
                  <RowActions verHref={`/costos/${costo.id}`} editarHref={`/costos/${costo.id}/editar`} />
                </td>
              </FilaTabla>
              )
            })
          )}
        </tbody>
      </table>
    </ContenedorTabla>
  )
}
