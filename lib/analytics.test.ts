import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { costosEsteMes, costoVigenteEn, gastosDelMes, pagosEsteMes, pagosPorMes, resultadoParcial } from './analytics'
import { costo, fecha, pago } from './test-utils'

const OCTUBRE = fecha(2026, 10, 26)

describe('costoVigenteEn', () => {
  it.each([
    ['sin fechas', costo(), true],
    ['fechas vacías de WordPress', costo({ fechaInicio: '', fechaBaja: '' }), true],
    ['baja en septiembre', costo({ fechaBaja: '2026-09-30' }), false],
    ['baja este mes (el mes de la baja se paga)', costo({ fechaBaja: '2026-10-03' }), true],
    ['alta en noviembre', costo({ fechaInicio: '2026-11-01' }), false],
    ['alta este mes', costo({ fechaInicio: '2026-10-25' }), true],
  ])('%s', (_caso, c, esperado) => {
    expect(costoVigenteEn(c, OCTUBRE)).toBe(esperado)
  })
})

describe('con fecha fija (26/10/2026 en Argentina)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-26T15:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('costos del mes: semanal × 52/12, anual / 12, mensual entero', () => {
    const total = costosEsteMes([
      costo({ monto: 12, frecuencia: 'SEMANAL' }),
      costo({ monto: 120, frecuencia: 'ANUAL' }),
      costo({ monto: 5, frecuencia: 'MENSUAL' }),
    ])
    expect(total.USD).toBeCloseTo(52 + 10 + 5)
  })

  it('costos del mes ignoran los dados de baja', () => {
    expect(costosEsteMes([costo({ monto: 10 }), costo({ monto: 99, fechaBaja: '2026-08-31' })]).USD).toBe(10)
  })

  it('costos del mes no mezclan monedas', () => {
    const total = costosEsteMes([costo({ monto: 10 }), costo({ monto: 5000, moneda: 'ARS' })])
    expect(total).toMatchObject({ USD: 10, ARS: 5000 })
  })

  it('gastosDelMes ordena de mayor a menor y saca los inactivos', () => {
    const gastos = gastosDelMes([
      costo({ nombreCosto: 'Chico', monto: 5 }),
      costo({ nombreCosto: 'Grande', monto: 50 }),
      costo({ nombreCosto: 'Viejo', monto: 500, fechaBaja: '2025-01-01' }),
    ])
    expect(gastos.map((g) => g.nombre)).toEqual(['Grande', 'Chico'])
  })

  it('un pago del día 1 cuenta en su mes (antes caía en el anterior)', () => {
    expect(pagosEsteMes([pago({ fecha: '2026-10-01', monto: 100 })]).USD).toBe(100)
    expect(pagosEsteMes([pago({ fecha: '2026-09-30', monto: 100 })]).USD).toBe(0)
  })

  it('pagosPorMes: últimos 12 meses, el pago del 1/10 en octubre', () => {
    const meses = pagosPorMes([pago({ fecha: '2026-10-01', monto: 7 }), pago({ fecha: '2025-11-30', monto: 3 })])
    expect(meses).toHaveLength(12)
    expect(meses[11].USD).toBe(7)
    expect(meses[0].USD).toBe(3)
  })

  it('resultadoParcial: pagos − costos por moneda, solo monedas con movimiento', () => {
    const resultado = resultadoParcial([pago({ fecha: '2026-10-05', monto: 1000 })], [costo({ monto: 100 })])
    expect(resultado).toEqual({ USD: 900 })
  })
})
