import { describe, expect, it } from 'vitest'
import { aInputFecha, formatDiasRelativos, formatFecha, formatFechaLarga, formatMonto } from './format'
import { fecha, normalizarEspacios } from './test-utils'

describe('formatFecha', () => {
  it('muestra el día correcto en Argentina (antes daba 30/09 para el 1/10)', () => {
    expect(formatFecha('2026-10-01')).toBe('01 oct. 2026')
  })

  it('acepta fechas con hora', () => {
    expect(formatFecha('2026-10-01T00:00:00')).toBe('01 oct. 2026')
  })

  it.each([null, undefined, '', 'basura'])('muestra — con %s', (valor) => {
    expect(formatFecha(valor)).toBe('—')
  })
})

describe('formatMonto', () => {
  it('formatea con la moneda', () => {
    expect(normalizarEspacios(formatMonto(1500.5, 'USD'))).toBe('US$ 1.500,50')
  })

  it('sin moneda usa USD', () => {
    expect(normalizarEspacios(formatMonto(10, null))).toBe('US$ 10,00')
  })

  it('pesos argentinos', () => {
    expect(normalizarEspacios(formatMonto(150000, 'ARS'))).toContain('150.000,00')
  })
})

describe('otros formatos', () => {
  it('aInputFecha deja YYYY-MM-DD para <input type="date">', () => {
    expect(aInputFecha('2026-10-01T10:00:00')).toBe('2026-10-01')
    expect(aInputFecha(null)).toBe('')
  })

  it.each([
    [0, 'hoy'],
    [1, 'mañana'],
    [-1, 'ayer'],
    [5, 'en 5 días'],
    [-3, 'hace 3 días'],
  ])('formatDiasRelativos(%i) = %s', (dias, esperado) => {
    expect(formatDiasRelativos(dias)).toBe(esperado)
  })

  it('formatFechaLarga empieza con mayúscula', () => {
    expect(formatFechaLarga(fecha(2026, 10, 26))).toBe('Lunes, 26 de octubre')
  })
})
