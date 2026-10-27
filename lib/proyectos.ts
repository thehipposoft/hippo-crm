import { compararFechas, diasEntre, hoy, mesesCompletos, MESES_POR_ANIO, parseFecha, type FechaCalendario } from './fechas'
import { MONEDA_POR_DEFECTO, type FrecuenciaPago, type Moneda, type PagoRow, type ProyectoRow } from './types'

const DIAS_POR_SEMANA = 7
const FRECUENCIA_POR_DEFECTO: FrecuenciaPago = 'MENSUAL'

const esDelProyecto = (pago: PagoRow, proyecto: ProyectoRow): boolean =>
  Number(pago.proyectoId) === Number(proyecto.id)

// Moneda del proyecto: la que guarda WordPress; mientras no la mande, la del primer pago.
export const monedaProyecto = (proyecto: ProyectoRow, pagos: PagoRow[]): Moneda =>
  proyecto.moneda ?? pagos.find((p) => esDelProyecto(p, proyecto))?.moneda ?? MONEDA_POR_DEFECTO

// Períodos iniciados entre dos fechas, contando el de `desde` (cobro por adelantado).
const periodosIniciados = (frecuencia: FrecuenciaPago, desde: FechaCalendario, hasta: FechaCalendario): number => {
  if (compararFechas(hasta, desde) < 0) return 0
  switch (frecuencia) {
    case 'SEMANAL':
      return Math.floor(diasEntre(desde, hasta) / DIAS_POR_SEMANA) + 1
    case 'MENSUAL':
      return mesesCompletos(desde, hasta) + 1
    case 'ANUAL':
      return Math.floor(mesesCompletos(desde, hasta) / MESES_POR_ANIO) + 1
  }
}

// Solo recurrentes con fecha de inicio. Corre hasta hoy, o hasta el deadline si ya pasó.
export const periodosAdeudados = (proyecto: ProyectoRow, fechaHoy: FechaCalendario = hoy()): number | null => {
  if (proyecto.tipoProyecto !== 'RECURRENTE') return null
  const inicio = parseFecha(proyecto.fechaInicio)
  if (!inicio) return null
  const fin = parseFecha(proyecto.deadline)
  const hasta = fin && compararFechas(fin, fechaHoy) < 0 ? fin : fechaHoy
  return periodosIniciados(proyecto.frecuenciaPago ?? FRECUENCIA_POR_DEFECTO, inicio, hasta)
}

export type ResumenPendiente = {
  moneda: Moneda
  adeudado: number
  pagado: number
  pendiente: number
  periodos: number | null
  // Pagos en otra moneda: no se descuentan (no hay tipo de cambio)
  otrasMonedas: Partial<Record<Moneda, number>>
}

export const resumenPendiente = (
  proyecto: ProyectoRow,
  pagos: PagoRow[],
  fechaHoy: FechaCalendario = hoy()
): ResumenPendiente => {
  const pagosProyecto = pagos.filter((p) => esDelProyecto(p, proyecto))
  const moneda = monedaProyecto(proyecto, pagosProyecto)
  const periodos = periodosAdeudados(proyecto, fechaHoy)
  const adeudado = periodos === null ? proyecto.valor : proyecto.valor * periodos

  let pagado = 0
  const otrasMonedas: Partial<Record<Moneda, number>> = {}
  for (const pago of pagosProyecto) {
    if (pago.moneda === moneda) {
      pagado += pago.monto
    } else {
      otrasMonedas[pago.moneda] = (otrasMonedas[pago.moneda] ?? 0) + pago.monto
    }
  }

  return { moneda, adeudado, pagado, pendiente: adeudado - pagado, periodos, otrasMonedas }
}
