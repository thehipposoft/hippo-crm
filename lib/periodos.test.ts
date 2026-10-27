import { describe, expect, it } from 'vitest'
import { enRango, esPeriodo, rangoDePeriodo } from './periodos'
import { fecha } from './test-utils'

const HOY = fecha(2026, 3, 15)
const SIN_RANGO = { desde: null, hasta: null }

describe('rangoDePeriodo', () => {
  it.each([
    ['TODO', { desde: null, hasta: null }],
    ['ESTE_MES', { desde: '2026-03-01', hasta: '2026-03-31' }],
    ['MES_PASADO', { desde: '2026-02-01', hasta: '2026-02-28' }],
    ['ESTE_ANIO', { desde: '2026-01-01', hasta: '2026-12-31' }],
    ['ANIO_PASADO', { desde: '2025-01-01', hasta: '2025-12-31' }],
  ] as const)('%s', (periodo, esperado) => {
    expect(rangoDePeriodo(periodo, SIN_RANGO, HOY)).toEqual(esperado)
  })

  it('mes pasado en enero es diciembre del año anterior', () => {
    expect(rangoDePeriodo('MES_PASADO', SIN_RANGO, fecha(2026, 1, 10))).toEqual({ desde: '2025-12-01', hasta: '2025-12-31' })
  })

  it('rango manual se respeta', () => {
    const manual = { desde: '2026-02-10', hasta: null }
    expect(rangoDePeriodo('RANGO', manual, HOY)).toBe(manual)
  })
})

describe('enRango', () => {
  const marzo = { desde: '2026-03-01', hasta: '2026-03-31' }

  it('incluye los bordes', () => {
    expect(enRango('2026-03-01', marzo)).toBe(true)
    expect(enRango('2026-03-31', marzo)).toBe(true)
    expect(enRango('2026-04-01', marzo)).toBe(false)
  })

  it('acepta fechas con hora', () => {
    expect(enRango('2026-03-31T23:00:00', marzo)).toBe(true)
  })

  it('sin rango entra todo, incluso sin fecha; con rango, sin fecha no entra', () => {
    expect(enRango(null, SIN_RANGO)).toBe(true)
    expect(enRango(null, marzo)).toBe(false)
  })

  it('rango abierto de un lado', () => {
    expect(enRango('2030-01-01', { desde: '2026-03-01', hasta: null })).toBe(true)
  })
})

it('esPeriodo valida lo que viene de la URL', () => {
  expect(esPeriodo('ESTE_MES')).toBe(true)
  expect(esPeriodo('cualquiera')).toBe(false)
  expect(esPeriodo(null)).toBe(false)
})
