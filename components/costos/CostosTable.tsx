'use client'

import Link from 'next/link'
import {
  CATEGORIA_COSTO_VALUES,
  CATEGORIAS_COSTO,
  FRECUENCIA_VALUES,
  FRECUENCIAS_PAGO,
  type CostoRow,
} from '@/lib/types'
import { EstadoPeriodoBadge } from './EstadoPeriodoBadge'
import { ContenedorTabla, FilaTabla } from '@/components/ui/FilaTabla'
import { CLASES_ITEM_MENU, ItemMenu, RowActions } from '@/components/ui/RowActions'
import { ThOrdenable, useOrdenTabla } from '@/components/ui/Orden'
import { useParamsUrl } from '@/components/ui/useParamsUrl'
import { costoVigenteEn, etiquetaPeriodo, labelCategoria, periodoDeFecha, periodosPendientes, resumenPeriodo, ultimoPago, type ResumenPeriodo } from '@/lib/costos'
import { parseFecha, type FechaCalendario } from '@/lib/fechas'
import { formatFecha, formatMonto } from '@/lib/format'
import { claveFecha, type ColumnaOrden } from '@/lib/orden'

const ICONO_PAGO = 'M12 4v16m8-8H4'
const ORDEN_ESTADO = { PENDIENTE: 0, PARCIAL: 1, PAGADO: 2 } as const

const labelFrecuencia = (frecuencia: CostoRow['frecuencia']): string =>
  FRECUENCIAS_PAGO.find((f) => f.value === frecuencia)?.label ?? frecuencia

// `debe`: tiene algún período impago hasta hoy (no solo el actual)
type FilaCosto = { costo: CostoRow; vigente: boolean; periodo: ResumenPeriodo; debe: boolean }

const COLUMNAS = {
  nombre: { valor: ({ costo }) => costo.nombreCosto, direccionInicial: 'asc' },
  categoria: { valor: ({ costo }) => labelCategoria(costo.categoria), direccionInicial: 'asc' },
  monto: { valor: ({ costo }) => [costo.moneda, costo.monto], direccionInicial: 'desc' },
  frecuencia: { valor: ({ costo }) => FRECUENCIA_VALUES.indexOf(costo.frecuencia), direccionInicial: 'asc' },
  periodo: { valor: ({ vigente, periodo }) => (vigente ? ORDEN_ESTADO[periodo.estado] : null), direccionInicial: 'asc' },
  ultimo: { valor: ({ costo }) => claveFecha(ultimoPago(costo)?.fecha), direccionInicial: 'desc' },
  renovacion: { valor: ({ costo }) => claveFecha(costo.fechaRenovacion), direccionInicial: 'asc' },
} satisfies Record<string, ColumnaOrden<FilaCosto>>

const PENDIENTES = 'pendientes'

interface CostosTableProps {
  costos: CostoRow[]
  // 'YYYY-MM-DD' de hoy, del server
  hoyIso: string
}

export const CostosTable = ({ costos, hoyIso }: CostosTableProps) => {
  const params = useParamsUrl()
  const fechaHoy = parseFecha(hoyIso) as FechaCalendario
  const { orden, cambiarOrden, ordenar } = useOrdenTabla(COLUMNAS, { columna: 'periodo', direccion: 'asc' })

  const filtro = params.get('cat')
  const categoria = CATEGORIA_COSTO_VALUES.find((c) => c === filtro) ?? null
  const soloPendientes = filtro === PENDIENTES

  const todas: FilaCosto[] = costos.map((costo) => ({
    costo,
    vigente: costoVigenteEn(costo, fechaHoy),
    periodo: resumenPeriodo(costo, periodoDeFecha(costo, fechaHoy)),
    debe: periodosPendientes(costo, fechaHoy).length > 0,
  }))
  const filas = ordenar(
    todas.filter(({ costo, debe }) => {
      if (categoria && costo.categoria !== categoria) return false
      if (soloPendientes && !debe) return false
      return true
    })
  )

  const pendientes = todas.filter((f) => f.debe).length
  const categoriasUsadas = CATEGORIAS_COSTO.filter((c) => costos.some((costo) => costo.categoria === c.value))
  const chips = [
    { valor: null, label: 'Todos' },
    { valor: PENDIENTES, label: `Por pagar (${pendientes})` },
    ...categoriasUsadas.map((c) => ({ valor: c.value, label: c.label })),
  ]
  const thProps = { orden, onOrdenar: cambiarOrden }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {chips.map(({ valor, label }) => (
          <button
            key={valor ?? 'todos'}
            type="button"
            onClick={() => params.set({ cat: valor })}
            aria-pressed={filtro === valor}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filtro === valor
                ? 'bg-dark-text text-white'
                : 'border border-slate-200 bg-white text-dark-text/60 hover:bg-brand-blue/10 hover:text-dark-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ContenedorTabla>
        <table className="w-full min-w-4xl text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-brand-white">
              <ThOrdenable id="nombre" {...thProps}>Costo</ThOrdenable>
              <ThOrdenable id="categoria" {...thProps}>Categoría</ThOrdenable>
              <ThOrdenable id="monto" {...thProps}>Monto</ThOrdenable>
              <ThOrdenable id="frecuencia" {...thProps}>Frecuencia</ThOrdenable>
              <ThOrdenable id="periodo" {...thProps}>Período actual</ThOrdenable>
              <ThOrdenable id="ultimo" {...thProps}>Último pago</ThOrdenable>
              <ThOrdenable id="renovacion" {...thProps}>Renovación</ThOrdenable>
              <th className="w-12 px-3 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-14 text-center text-sm text-dark-text/40">
                  {costos.length === 0 ? 'No hay costos registrados todavía.' : 'No hay costos con este filtro.'}
                </td>
              </tr>
            ) : (
              filas.map(({ costo, vigente, periodo }) => {
                const ultimo = ultimoPago(costo)
                return (
                  <FilaTabla key={costo.id} href={`/costos/${costo.id}`} className={vigente ? '' : 'opacity-50'}>
                    <td className="px-5 py-4">
                      <Link href={`/costos/${costo.id}`} className="font-medium text-dark-text hover:text-brand-blue">
                        {costo.nombreCosto}
                      </Link>
                      {!vigente && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-dark-text/60">Inactivo</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-dark-text/60">{labelCategoria(costo.categoria) ?? '—'}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-dark-text tabular-nums">{formatMonto(costo.monto, costo.moneda)}</td>
                    <td className="px-5 py-4 text-dark-text/60">{labelFrecuencia(costo.frecuencia)}</td>
                    <td className="px-5 py-4">
                      {vigente ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <EstadoPeriodoBadge resumen={periodo} moneda={costo.moneda} />
                          <span className="text-xs text-dark-text/40">{etiquetaPeriodo(periodo.periodo)}</span>
                        </div>
                      ) : (
                        <span className="text-dark-text/40">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-dark-text/60 tabular-nums">
                      {ultimo ? formatFecha(ultimo.fecha) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-dark-text/60 tabular-nums">{formatFecha(costo.fechaRenovacion)}</td>
                    <td className="px-3 py-4" data-sin-navegar>
                      <RowActions
                        verHref={`/costos/${costo.id}`}
                        editarHref={`/costos/${costo.id}/editar`}
                        extra={(cerrar) => (
                          <Link href={`/costos/${costo.id}/pagos/nuevo?volver=/costos`} onClick={cerrar} role="menuitem" className={CLASES_ITEM_MENU}>
                            <ItemMenu icono={ICONO_PAGO}>Registrar pago</ItemMenu>
                          </Link>
                        )}
                      />
                    </td>
                  </FilaTabla>
                )
              })
            )}
          </tbody>
        </table>
      </ContenedorTabla>
    </div>
  )
}
