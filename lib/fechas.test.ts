import { afterEach, describe, expect, it, vi } from 'vitest'
import { diasEntre, finDeMes, hoy, indiceMes, mesesCompletos, parseFecha, sumarDias, sumarMeses, sumarMesesMismoDia } from './fechas'
import { fecha } from './test-utils'

describe('parseFecha', () => {
  it('lee YYYY-MM-DD como fecha de calendario, sin correrse de día', () => {
    expect(parseFecha('2026-10-01')).toEqual(fecha(2026, 10, 1))
  })

  it('ignora la hora si viene', () => {
    expect(parseFecha('2026-10-01T23:30:00')).toEqual(fecha(2026, 10, 1))
  })

  it.each([null, undefined, '', 'mañana', '01/10/2026'])('devuelve null con %s', (valor) => {
    expect(parseFecha(valor)).toBeNull()
  })
})

describe('hoy', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('usa la hora de Argentina: 01:30 UTC del 1/11 todavía es 31/10', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-01T01:30:00Z'))
    expect(hoy()).toEqual(fecha(2026, 10, 31))
  })

  it('a las 03:00 UTC ya es el día siguiente en Argentina', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-01T03:00:00Z'))
    expect(hoy()).toEqual(fecha(2026, 11, 1))
  })
})

describe('mesesCompletos', () => {
  it.each([
    [fecha(2026, 8, 15), fecha(2026, 10, 14), 1],
    [fecha(2026, 8, 15), fecha(2026, 10, 15), 2],
    [fecha(2025, 11, 1), fecha(2026, 10, 26), 11],
    [fecha(2026, 1, 31), fecha(2026, 2, 28), 0],
  ])('%o → %o = %i', (desde, hasta, esperado) => {
    expect(mesesCompletos(desde, hasta)).toBe(esperado)
  })
})

describe('sumarMesesMismoDia', () => {
  it('mantiene el día', () => {
    expect(sumarMesesMismoDia(fecha(2026, 8, 15), 3)).toEqual(fecha(2026, 11, 15))
  })

  it('si el mes es más corto cae en su último día', () => {
    expect(sumarMesesMismoDia(fecha(2026, 1, 31), 1)).toEqual(fecha(2026, 2, 28))
    expect(sumarMesesMismoDia(fecha(2028, 1, 31), 1)).toEqual(fecha(2028, 2, 29))
  })

  it('no arrastra el recorte: 31/01 + 2 meses = 31/03', () => {
    expect(sumarMesesMismoDia(fecha(2026, 1, 31), 2)).toEqual(fecha(2026, 3, 31))
  })

  it('cruza de año', () => {
    expect(sumarMesesMismoDia(fecha(2026, 11, 30), 3)).toEqual(fecha(2027, 2, 28))
  })
})

describe('otras utilidades', () => {
  it('sumarDias cruza de año', () => {
    expect(sumarDias(fecha(2026, 12, 30), 3)).toEqual(fecha(2027, 1, 2))
  })

  it('diasEntre cuenta días de calendario', () => {
    expect(diasEntre(fecha(2025, 12, 31), fecha(2026, 1, 1))).toBe(1)
    expect(diasEntre(fecha(2026, 10, 26), fecha(2026, 10, 20))).toBe(-6)
  })

  it('finDeMes respeta bisiestos', () => {
    expect(finDeMes(fecha(2028, 2, 10))).toEqual(fecha(2028, 2, 29))
    expect(finDeMes(fecha(2026, 2, 10))).toEqual(fecha(2026, 2, 28))
  })

  it('sumarMeses va al día 1 (para recorrer meses)', () => {
    expect(sumarMeses(fecha(2026, 10, 26), -11)).toEqual(fecha(2025, 11, 1))
  })

  it('indiceMes compara meses de distintos años', () => {
    expect(indiceMes(fecha(2027, 1, 1)) - indiceMes(fecha(2026, 12, 31))).toBe(1)
  })
})
