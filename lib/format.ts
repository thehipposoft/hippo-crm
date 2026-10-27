import { aUtc, parseFecha, type FechaCalendario } from './fechas'
import { MONEDA_POR_DEFECTO } from './types'

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
