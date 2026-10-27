import {
  compararFechas,
  diasEntre,
  finDeMes,
  hoy,
  inicioDeMes,
  mesesCompletos,
  MESES_POR_ANIO,
  minFecha,
  parseFecha,
  sumarDias,
  sumarMesesMismoDia,
  type FechaCalendario,
} from './fechas'
import { activasEsteMes, adeudadoPorUnidades, cobraPorUnidad, inicioCobroPorUnidad, mesesFacturables } from './unidades'
import { MONEDA_POR_DEFECTO, type FrecuenciaPago, type Moneda, type PagoRow, type ProyectoRow } from './types'

const DIAS_POR_SEMANA = 7
const FRECUENCIA_POR_DEFECTO: FrecuenciaPago = 'MENSUAL'

const esDelProyecto = (pago: PagoRow, proyecto: ProyectoRow): boolean =>
  Number(pago.proyectoId) === Number(proyecto.id)

// Moneda del proyecto: la que guarda WordPress; mientras no la mande, la del primer pago.
export const monedaProyecto = (proyecto: ProyectoRow, pagos: PagoRow[]): Moneda =>
  proyecto.moneda ?? pagos.find((p) => esDelProyecto(p, proyecto))?.moneda ?? MONEDA_POR_DEFECTO

// Fecha en que empieza el período `n` (0 = el de `inicio`)
export const inicioPeriodo = (inicio: FechaCalendario, frecuencia: FrecuenciaPago, n: number): FechaCalendario => {
  switch (frecuencia) {
    case 'SEMANAL':
      return sumarDias(inicio, n * DIAS_POR_SEMANA)
    case 'MENSUAL':
      return sumarMesesMismoDia(inicio, n)
    case 'ANUAL':
      return sumarMesesMismoDia(inicio, n * MESES_POR_ANIO)
  }
}

// Cota inferior rápida de los períodos completos; el conteo exacto lo hace `periodosIniciados`
const estimarPeriodos = (frecuencia: FrecuenciaPago, desde: FechaCalendario, hasta: FechaCalendario): number => {
  switch (frecuencia) {
    case 'SEMANAL':
      return Math.floor(diasEntre(desde, hasta) / DIAS_POR_SEMANA)
    case 'MENSUAL':
      return mesesCompletos(desde, hasta)
    case 'ANUAL':
      return Math.floor(mesesCompletos(desde, hasta) / MESES_POR_ANIO)
  }
}

// Períodos que empezaron entre `desde` y `hasta` inclusive, contando el de `desde`
// (cobro por adelantado). Cuenta con `inicioPeriodo` para que fin de mes sea consistente.
export const periodosIniciados = (frecuencia: FrecuenciaPago, desde: FechaCalendario, hasta: FechaCalendario): number => {
  if (compararFechas(hasta, desde) < 0) return 0
  let n = Math.max(0, estimarPeriodos(frecuencia, desde, hasta) - 1)
  while (compararFechas(inicioPeriodo(desde, frecuencia, n), hasta) <= 0) n++
  return n
}

// Solo recurrentes con fecha de inicio. Corre hasta hoy, o hasta el deadline si ya pasó.
export const periodosAdeudados = (proyecto: ProyectoRow, fechaHoy: FechaCalendario = hoy()): number | null => {
  if (proyecto.tipoProyecto !== 'RECURRENTE') return null
  // Por unidad: meses calendario cobrados
  if (cobraPorUnidad(proyecto)) return mesesFacturables(proyecto, fechaHoy).length
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
  const adeudado = cobraPorUnidad(proyecto)
    ? adeudadoPorUnidades(proyecto, fechaHoy)
    : periodos === null
      ? proyecto.valor
      : proyecto.valor * periodos

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

// Diferencias menores a medio centavo se consideran redondeo
const TOLERANCIA_REDONDEO = 0.005

export type Saldo =
  | { tipo: 'PENDIENTE'; monto: number }
  | { tipo: 'AL_DIA' }
  // Pagó de más (on-off) o por adelantado (recurrente)
  | { tipo: 'A_FAVOR'; monto: number }

export const saldoProyecto = (resumen: ResumenPendiente): Saldo => {
  if (resumen.pendiente > TOLERANCIA_REDONDEO) return { tipo: 'PENDIENTE', monto: resumen.pendiente }
  if (resumen.pendiente < -TOLERANCIA_REDONDEO) return { tipo: 'A_FAVOR', monto: -resumen.pendiente }
  return { tipo: 'AL_DIA' }
}

export type CobroRecurrente = {
  proyecto: ProyectoRow
  resumen: ResumenPendiente
  // Períodos que empiezan dentro del mes actual y lo que suman
  cuotasEsteMes: number
  montoEsteMes: number
  // Inicio del próximo período después de hoy; null si el contrato ya terminó
  proximoVencimiento: FechaCalendario | null
  // Solo cobro por unidad: unidades activas este mes
  unidadesEsteMes: number | null
}

// Solo recurrentes con fecha de inicio. El deadline, si existe, es el fin del contrato.
export const cobroRecurrente = (
  proyecto: ProyectoRow,
  pagos: PagoRow[],
  fechaHoy: FechaCalendario = hoy()
): CobroRecurrente | null => {
  if (proyecto.tipoProyecto !== 'RECURRENTE') return null
  const porUnidad = cobraPorUnidad(proyecto)
  const inicio = porUnidad ? inicioCobroPorUnidad(proyecto) : parseFecha(proyecto.fechaInicio)
  if (!inicio) return null

  const frecuencia = porUnidad ? 'MENSUAL' : (proyecto.frecuenciaPago ?? FRECUENCIA_POR_DEFECTO)
  const fin = parseFecha(proyecto.deadline)
  const limite = (fecha: FechaCalendario): FechaCalendario => (fin ? minFecha(fecha, fin) : fecha)

  const antesDelMes = periodosIniciados(frecuencia, inicio, limite(sumarDias(inicioDeMes(fechaHoy), -1)))
  const hastaFinDeMes = periodosIniciados(frecuencia, inicio, limite(finDeMes(fechaHoy)))
  const cuotasEsteMes = hastaFinDeMes - antesDelMes

  const siguiente = inicioPeriodo(inicio, frecuencia, periodosIniciados(frecuencia, inicio, fechaHoy))
  const proximoVencimiento = fin && compararFechas(siguiente, fin) > 0 ? null : siguiente

  if (porUnidad) {
    const unidadesEsteMes = activasEsteMes(proyecto, fechaHoy)
    const montoEsteMes = (unidadesEsteMes ?? 0) * proyecto.valor
    return {
      proyecto,
      resumen: resumenPendiente(proyecto, pagos, fechaHoy),
      cuotasEsteMes: montoEsteMes > 0 ? 1 : 0,
      montoEsteMes,
      proximoVencimiento,
      unidadesEsteMes,
    }
  }

  return {
    proyecto,
    resumen: resumenPendiente(proyecto, pagos, fechaHoy),
    cuotasEsteMes,
    montoEsteMes: cuotasEsteMes * proyecto.valor,
    proximoVencimiento,
    unidadesEsteMes: null,
  }
}

const CENTAVOS = 100

export type SugerenciaPago = {
  moneda: Moneda
  monto: number | null
  // De dónde sale el monto, para explicarlo en el formulario
  origen: 'CUOTA' | 'SALDO' | null
}

// Recurrente: una cuota. Pago único: lo que falta pagar, si falta algo.
export const sugerenciaPago = (
  proyecto: ProyectoRow,
  pagos: PagoRow[],
  fechaHoy: FechaCalendario = hoy()
): SugerenciaPago => {
  const resumen = resumenPendiente(proyecto, pagos, fechaHoy)
  // Por unidad: la cuota del mes es unidades activas × precio
  if (cobraPorUnidad(proyecto)) {
    const monto = (activasEsteMes(proyecto, fechaHoy) ?? 0) * proyecto.valor
    return { moneda: resumen.moneda, monto: monto > 0 ? monto : null, origen: monto > 0 ? 'CUOTA' : null }
  }
  if (proyecto.tipoProyecto === 'RECURRENTE' && proyecto.valor > 0) {
    return { moneda: resumen.moneda, monto: proyecto.valor, origen: 'CUOTA' }
  }
  const saldo = saldoProyecto(resumen)
  if (saldo.tipo === 'PENDIENTE') {
    return { moneda: resumen.moneda, monto: Math.round(saldo.monto * CENTAVOS) / CENTAVOS, origen: 'SALDO' }
  }
  return { moneda: resumen.moneda, monto: null, origen: null }
}
