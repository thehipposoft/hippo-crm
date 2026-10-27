// Fechas de calendario (sin hora). WordPress manda 'YYYY-MM-DD' y `new Date()`
// las interpreta como UTC: en Argentina (UTC-3) caen el día anterior. Acá se
// trabaja con año/mes/día y "hoy" se calcula en la zona horaria del negocio,
// así server (Netlify, UTC) y browser dan lo mismo.

export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires'
export const MESES_POR_ANIO = 12

const MS_POR_DIA = 24 * 60 * 60 * 1000
const PATRON_FECHA = /^(\d{4})-(\d{2})-(\d{2})/

// mes: 0-11, igual que Date
export type FechaCalendario = { anio: number; mes: number; dia: number }

export const parseFecha = (valor: string | null | undefined): FechaCalendario | null => {
  if (!valor) return null
  const match = PATRON_FECHA.exec(valor)
  if (!match) return null
  return { anio: Number(match[1]), mes: Number(match[2]) - 1, dia: Number(match[3]) }
}

export const hoy = (): FechaCalendario => {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date())
  const valor = (tipo: Intl.DateTimeFormatPartTypes): number =>
    Number(partes.find((p) => p.type === tipo)?.value)
  return { anio: valor('year'), mes: valor('month') - 1, dia: valor('day') }
}

// Date a medianoche UTC: formatear siempre con timeZone 'UTC'
export const aUtc = (fecha: FechaCalendario): Date => new Date(Date.UTC(fecha.anio, fecha.mes, fecha.dia))

export const mismoMes = (a: FechaCalendario, b: FechaCalendario): boolean =>
  a.anio === b.anio && a.mes === b.mes

export const compararFechas = (a: FechaCalendario, b: FechaCalendario): number =>
  aUtc(a).getTime() - aUtc(b).getTime()

export const diasEntre = (desde: FechaCalendario, hasta: FechaCalendario): number =>
  Math.round((aUtc(hasta).getTime() - aUtc(desde).getTime()) / MS_POR_DIA)

// Meses completos transcurridos (15/08 → 14/10 = 1, 15/08 → 15/10 = 2)
export const mesesCompletos = (desde: FechaCalendario, hasta: FechaCalendario): number => {
  const meses = (hasta.anio - desde.anio) * MESES_POR_ANIO + (hasta.mes - desde.mes)
  return hasta.dia < desde.dia ? meses - 1 : meses
}

// Índice correlativo de mes, para comparar meses sin importar el día
export const indiceMes = (fecha: FechaCalendario): number => fecha.anio * MESES_POR_ANIO + fecha.mes

export const sumarMeses = (fecha: FechaCalendario, cantidad: number): FechaCalendario => {
  const d = new Date(Date.UTC(fecha.anio, fecha.mes + cantidad, 1))
  return { anio: d.getUTCFullYear(), mes: d.getUTCMonth(), dia: 1 }
}

export const desdeUtc = (fecha: Date): FechaCalendario => ({
  anio: fecha.getUTCFullYear(),
  mes: fecha.getUTCMonth(),
  dia: fecha.getUTCDate(),
})

export const sumarDias = (fecha: FechaCalendario, dias: number): FechaCalendario =>
  desdeUtc(new Date(Date.UTC(fecha.anio, fecha.mes, fecha.dia + dias)))

const diasDelMes = (anio: number, mes: number): number => new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate()

// Suma meses manteniendo el día; si el mes destino es más corto, cae en su último día (31/01 + 1 → 28/02)
export const sumarMesesMismoDia = (fecha: FechaCalendario, cantidad: number): FechaCalendario => {
  const destino = sumarMeses(fecha, cantidad)
  return { ...destino, dia: Math.min(fecha.dia, diasDelMes(destino.anio, destino.mes)) }
}

export const inicioDeMes = (fecha: FechaCalendario): FechaCalendario => ({ ...fecha, dia: 1 })

export const finDeMes = (fecha: FechaCalendario): FechaCalendario => ({
  ...fecha,
  dia: diasDelMes(fecha.anio, fecha.mes),
})

export const minFecha = (a: FechaCalendario, b: FechaCalendario): FechaCalendario => (compararFechas(a, b) <= 0 ? a : b)

export const aIso = (fecha: FechaCalendario): string => aUtc(fecha).toISOString().slice(0, 10)
