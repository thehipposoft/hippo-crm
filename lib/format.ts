import { aUtc, parseFecha, type FechaCalendario } from './fechas'
import { MONEDA_POR_DEFECTO, type FrecuenciaPago } from './types'

const LOCALE = 'es-UY'

export const formatFecha = (valor: string | null | undefined): string => {
  const fecha = parseFecha(valor)
  if (!fecha) return '—'
  return aUtc(fecha).toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export const formatMes = (fecha: FechaCalendario): string =>
  aUtc(fecha).toLocaleDateString(LOCALE, { month: 'short', year: 'numeric', timeZone: 'UTC' })

export const formatMonto = (monto: number, moneda?: string | null): string =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency: moneda || MONEDA_POR_DEFECTO }).format(monto)

// Valor para <input type="date">: 'YYYY-MM-DD' o ''
export const aInputFecha = (valor: string | null | undefined): string => valor?.slice(0, 10) ?? ''

// "hoy", "mañana", "en 5 días", "ayer", "hace 3 días"
export const formatDiasRelativos = (dias: number): string => {
  if (dias === 0) return 'hoy'
  if (dias === 1) return 'mañana'
  if (dias === -1) return 'ayer'
  return dias > 0 ? `en ${dias} días` : `hace ${-dias} días`
}

// Fecha corta sin año: "26 oct."
export const formatFechaCorta = (fecha: FechaCalendario): string =>
  aUtc(fecha).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', timeZone: 'UTC' })

// "lunes 26 de octubre"
export const formatFechaLarga = (fecha: FechaCalendario): string => {
  const texto = aUtc(fecha).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export const SUFIJO_FRECUENCIA: Record<FrecuenciaPago, string> = {
  SEMANAL: '/ semana',
  MENSUAL: '/ mes',
  ANUAL: '/ año',
}

// "US$ 5,00 / casilla" para cobro por unidad, "US$ 300,00 / mes" para recurrentes
export const formatCuota = (
  valor: number,
  moneda: string | null | undefined,
  proyecto: { tipoProyecto: string; frecuenciaPago: FrecuenciaPago | null; unidad?: string | null }
): string => {
  const monto = formatMonto(valor, moneda)
  if (proyecto.tipoProyecto !== 'RECURRENTE') return monto
  if (proyecto.unidad) return `${monto} / ${proyecto.unidad}`
  return proyecto.frecuenciaPago ? `${monto} ${SUFIJO_FRECUENCIA[proyecto.frecuenciaPago]}` : monto
}
