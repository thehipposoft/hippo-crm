import { ESTADOS_CON_DEUDA } from '@/lib/dashboard'
import { hoy, type FechaCalendario } from '@/lib/fechas'
import { claveFecha, ordenarPor } from '@/lib/orden'
import {
  cobroRecurrente,
  resumenPendiente,
  saldoProyecto,
  type CobroRecurrente,
  type ResumenPendiente,
  type Saldo,
} from '@/lib/proyectos'
import type { Moneda, PagoRow, ProyectoRow, UnidadRow } from '@/lib/types'
import { activasEn, cobraPorUnidad, detallePorMes, type MesUnidades } from '@/lib/unidades'

export type LineaProyecto = { proyecto: ProyectoRow; resumen: ResumenPendiente; saldo: Saldo }

export type TotalMoneda = { adeudado: number; pagado: number; saldo: number }

// Últimos meses que se muestran en el detalle por unidad
export const MESES_DETALLE_UNIDADES = 12

export type DetalleUnidades = {
  proyecto: ProyectoRow
  moneda: Moneda
  // Más reciente primero
  meses: MesUnidades[]
  activasEsteMes: UnidadRow[]
}

export type EstadoDeCuenta = {
  proyectos: LineaProyecto[]
  totales: Partial<Record<Moneda, TotalMoneda>>
  // Pagos de esos proyectos, más nuevo primero
  movimientos: PagoRow[]
  proximos: (CobroRecurrente & { proximoVencimiento: FechaCalendario })[]
  hayOtrasMonedas: boolean
  unidades: DetalleUnidades[]
}

// Solo proyectos facturables (activos, en pausa o cerrados): un presupuesto no es deuda
export const armarEstadoDeCuenta = (
  proyectos: ProyectoRow[],
  pagos: PagoRow[],
  fechaHoy: FechaCalendario = hoy()
): EstadoDeCuenta => {
  const facturables = proyectos.filter((p) => ESTADOS_CON_DEUDA.includes(p.estado))
  const ids = new Set(facturables.map((p) => Number(p.id)))

  const lineas = facturables.map((proyecto) => {
    const resumen = resumenPendiente(proyecto, pagos, fechaHoy)
    return { proyecto, resumen, saldo: saldoProyecto(resumen) }
  })

  const totales: Partial<Record<Moneda, TotalMoneda>> = {}
  for (const { resumen } of lineas) {
    const total = (totales[resumen.moneda] ??= { adeudado: 0, pagado: 0, saldo: 0 })
    total.adeudado += resumen.adeudado
    total.pagado += resumen.pagado
    total.saldo += resumen.pendiente
  }

  const movimientos = ordenarPor(
    pagos.filter((p) => ids.has(Number(p.proyectoId))),
    { valor: (p) => [claveFecha(p.fecha), p.id], direccionInicial: 'desc' },
    'desc'
  )

  const proximos = facturables
    .filter((p) => p.estado === 'ACTIVO')
    .flatMap((p) => {
      const cobro = cobroRecurrente(p, pagos, fechaHoy)
      return cobro?.proximoVencimiento ? [{ ...cobro, proximoVencimiento: cobro.proximoVencimiento }] : []
    })

  const unidades = lineas
    .filter(({ proyecto }) => cobraPorUnidad(proyecto))
    .map(({ proyecto, resumen }) => ({
      proyecto,
      moneda: resumen.moneda,
      meses: detallePorMes(proyecto, fechaHoy).reverse().slice(0, MESES_DETALLE_UNIDADES),
      activasEsteMes: activasEn(proyecto.unidades ?? [], fechaHoy),
    }))

  return {
    proyectos: lineas,
    totales,
    movimientos,
    proximos,
    unidades,
    hayOtrasMonedas: lineas.some((l) => Object.keys(l.resumen.otrasMonedas).length > 0),
  }
}
