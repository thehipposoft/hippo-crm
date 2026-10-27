import { aIso, finDeMes, hoy, inicioDeMes, sumarMeses, type FechaCalendario } from './fechas'

export const PERIODOS = [
  { value: 'TODO', label: 'Todo' },
  { value: 'ESTE_MES', label: 'Este mes' },
  { value: 'MES_PASADO', label: 'Mes pasado' },
  { value: 'ESTE_ANIO', label: 'Este año' },
  { value: 'ANIO_PASADO', label: 'Año pasado' },
  { value: 'RANGO', label: 'Rango' },
] as const

export type Periodo = (typeof PERIODOS)[number]['value']

// Fechas 'YYYY-MM-DD', inclusivas; null = sin límite
export type Rango = { desde: string | null; hasta: string | null }

export const esPeriodo = (valor: string | null): valor is Periodo => PERIODOS.some((p) => p.value === valor)

const DIC = 11

export const rangoDePeriodo = (periodo: Periodo, manual: Rango, fechaHoy: FechaCalendario = hoy()): Rango => {
  switch (periodo) {
    case 'TODO':
      return { desde: null, hasta: null }
    case 'ESTE_MES':
      return { desde: aIso(inicioDeMes(fechaHoy)), hasta: aIso(finDeMes(fechaHoy)) }
    case 'MES_PASADO': {
      const mes = sumarMeses(fechaHoy, -1)
      return { desde: aIso(mes), hasta: aIso(finDeMes(mes)) }
    }
    case 'ESTE_ANIO':
      return { desde: `${fechaHoy.anio}-01-01`, hasta: `${fechaHoy.anio}-12-31` }
    case 'ANIO_PASADO':
      return { desde: `${fechaHoy.anio - 1}-01-01`, hasta: aIso({ anio: fechaHoy.anio - 1, mes: DIC, dia: 31 }) }
    case 'RANGO':
      return manual
  }
}

// Sin rango entra todo (también lo que no tiene fecha); con rango, solo fechas dentro
export const enRango = (fecha: string | null | undefined, rango: Rango): boolean => {
  if (!rango.desde && !rango.hasta) return true
  const dia = fecha?.slice(0, 10)
  if (!dia) return false
  if (rango.desde && dia < rango.desde) return false
  if (rango.hasta && dia > rango.hasta) return false
  return true
}
