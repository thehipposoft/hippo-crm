import { agruparPorMoneda } from './analytics'
import { porCobrar, recurrentesDelMes, type PorCobrar } from './dashboard'
import { hoy, parseFecha, type FechaCalendario } from './fechas'
import { claveFecha, ordenarPor } from './orden'
import type { CobroRecurrente } from './proyectos'
import type { Moneda, PagoRow, ProyectoRow } from './types'

export const ULTIMOS_PAGOS = 5

export type ResumenCliente = {
  // Todo lo cobrado, por moneda
  cobradoTotal: Partial<Record<Moneda, number>>
  cobradoEsteAnio: Partial<Record<Moneda, number>>
  porCobrar: PorCobrar
  recurrentes: CobroRecurrente[]
  pagos: PagoRow[]
}

const sinCeros = (montos: Record<Moneda, number>): Partial<Record<Moneda, number>> => {
  const resultado: Partial<Record<Moneda, number>> = {}
  for (const [moneda, monto] of Object.entries(montos) as [Moneda, number][]) {
    if (monto !== 0) resultado[moneda] = monto
  }
  return resultado
}

// Pagos de los proyectos del cliente (el endpoint de pagos no filtra por cliente)
export const pagosDelCliente = (proyectos: ProyectoRow[], pagos: PagoRow[]): PagoRow[] => {
  const ids = new Set(proyectos.map((p) => Number(p.id)))
  return pagos.filter((p) => ids.has(Number(p.proyectoId)))
}

export const resumenCliente = (
  proyectos: ProyectoRow[],
  todosLosPagos: PagoRow[],
  fechaHoy: FechaCalendario = hoy()
): ResumenCliente => {
  const pagos = ordenarPor(
    pagosDelCliente(proyectos, todosLosPagos),
    { valor: (p) => [claveFecha(p.fecha), p.id], direccionInicial: 'desc' },
    'desc'
  )
  const esteAnio = pagos.filter((p) => parseFecha(p.fecha)?.anio === fechaHoy.anio)

  return {
    cobradoTotal: sinCeros(agruparPorMoneda(pagos)),
    cobradoEsteAnio: sinCeros(agruparPorMoneda(esteAnio)),
    porCobrar: porCobrar(proyectos, pagos, fechaHoy),
    recurrentes: recurrentesDelMes(proyectos, pagos, fechaHoy),
    pagos,
  }
}
