import { compararFechas, hoy, indiceMes, inicioDeMes, minFecha, parseFecha, sumarMeses, type FechaCalendario } from './fechas'
import type { ProyectoRow, UnidadRow } from './types'

// Proyecto que se cobra por unidad (casillas, licencias…): valor = precio por unidad por mes
export const cobraPorUnidad = (proyecto: ProyectoRow): boolean =>
  proyecto.tipoProyecto === 'RECURRENTE' && Boolean(proyecto.unidad?.trim())

// "Mes completo": cuenta en el mes si estuvo activa al menos un día (el mes del alta y el de la baja se cobran)
export const unidadActivaEn = (unidad: UnidadRow, mes: FechaCalendario): boolean => {
  const alta = parseFecha(unidad.fechaAlta)
  if (!alta) return false
  const baja = parseFecha(unidad.fechaBaja)
  const indice = indiceMes(mes)
  return indiceMes(alta) <= indice && (!baja || indiceMes(baja) >= indice)
}

export const activasEn = (unidades: readonly UnidadRow[], mes: FechaCalendario): UnidadRow[] =>
  unidades.filter((u) => unidadActivaEn(u, mes))

const primeraAlta = (unidades: readonly UnidadRow[]): FechaCalendario | null =>
  unidades
    .map((u) => parseFecha(u.fechaAlta))
    .filter((f): f is FechaCalendario => f !== null)
    .sort(compararFechas)[0] ?? null

// Inicio del cobro: la fecha de inicio del proyecto o, si no tiene, la primera alta
export const inicioCobroPorUnidad = (proyecto: ProyectoRow): FechaCalendario | null =>
  parseFecha(proyecto.fechaInicio) ?? primeraAlta(proyecto.unidades ?? [])

// Meses calendario que se cobran: del mes de inicio al actual (o al del deadline si ya pasó)
export const mesesFacturables = (proyecto: ProyectoRow, fechaHoy: FechaCalendario = hoy()): FechaCalendario[] => {
  const inicio = inicioCobroPorUnidad(proyecto)
  if (!inicio) return []
  const fin = parseFecha(proyecto.deadline)
  const hasta = inicioDeMes(fin ? minFecha(fechaHoy, fin) : fechaHoy)

  const meses: FechaCalendario[] = []
  for (let mes = inicioDeMes(inicio); indiceMes(mes) <= indiceMes(hasta); mes = sumarMeses(mes, 1)) {
    meses.push(mes)
  }
  return meses
}

export type MesUnidades = {
  mes: FechaCalendario
  activas: number
  // Altas y bajas con fecha dentro del mes
  altas: number
  bajas: number
  monto: number
}

const esDelMes = (valor: string | null, mes: FechaCalendario): boolean => {
  const f = parseFecha(valor)
  return f !== null && indiceMes(f) === indiceMes(mes)
}

export const detallePorMes = (proyecto: ProyectoRow, fechaHoy: FechaCalendario = hoy()): MesUnidades[] => {
  const unidades = proyecto.unidades ?? []
  return mesesFacturables(proyecto, fechaHoy).map((mes) => {
    const activas = activasEn(unidades, mes).length
    return {
      mes,
      activas,
      altas: unidades.filter((u) => esDelMes(u.fechaAlta, mes)).length,
      bajas: unidades.filter((u) => esDelMes(u.fechaBaja, mes)).length,
      monto: activas * proyecto.valor,
    }
  })
}

export const adeudadoPorUnidades = (proyecto: ProyectoRow, fechaHoy: FechaCalendario = hoy()): number =>
  detallePorMes(proyecto, fechaHoy).reduce((total, m) => total + m.monto, 0)

// Unidades activas en el mes actual, si el mes se cobra (null si el contrato no corre)
export const activasEsteMes = (proyecto: ProyectoRow, fechaHoy: FechaCalendario = hoy()): number | null => {
  const meses = mesesFacturables(proyecto, fechaHoy)
  const ultimo = meses.at(-1)
  if (!ultimo || indiceMes(ultimo) !== indiceMes(fechaHoy)) return null
  return activasEn(proyecto.unidades ?? [], fechaHoy).length
}
