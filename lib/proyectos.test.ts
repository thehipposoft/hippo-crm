import { describe, expect, it } from 'vitest'
import { aIso } from './fechas'
import { cobroRecurrente, monedaProyecto, periodosAdeudados, resumenPendiente, saldoProyecto } from './proyectos'
import { fecha, pago, proyecto, recurrente } from './test-utils'

const HOY = fecha(2026, 10, 26)

describe('monedaProyecto', () => {
  it('usa la moneda del proyecto', () => {
    expect(monedaProyecto(proyecto({ moneda: 'ARS' }), [pago({ moneda: 'USD' })])).toBe('ARS')
  })

  it('sin moneda, toma la del primer pago del proyecto', () => {
    const pagos = [pago({ proyectoId: 2, moneda: 'EUR' }), pago({ proyectoId: 1, moneda: 'AUD' })]
    expect(monedaProyecto(proyecto({ moneda: null }), pagos)).toBe('AUD')
  })

  it('sin moneda ni pagos, USD', () => {
    expect(monedaProyecto(proyecto({ moneda: null }), [])).toBe('USD')
  })
})

describe('periodosAdeudados', () => {
  it('on-off no tiene períodos', () => {
    expect(periodosAdeudados(proyecto(), HOY)).toBeNull()
  })

  it('recurrente sin fecha de inicio: null', () => {
    expect(periodosAdeudados(recurrente({ fechaInicio: null }), HOY)).toBeNull()
  })

  it.each([
    ['mensual desde 15/08 al 26/10', recurrente(), HOY, 3],
    ['mensual desde 15/08 al 14/10', recurrente(), fecha(2026, 10, 14), 2],
    ['semanal desde 1/10 al 26/10', recurrente({ fechaInicio: '2026-10-01', frecuenciaPago: 'SEMANAL' }), HOY, 4],
    ['anual desde 1/11/2025', recurrente({ fechaInicio: '2025-11-01', frecuenciaPago: 'ANUAL' }), HOY, 1],
    ['deadline pasado corta el conteo', recurrente({ deadline: '2026-09-20' }), HOY, 2],
    ['inicio futuro', recurrente({ fechaInicio: '2026-12-01' }), HOY, 0],
    ['31/01 → 28/02 ya empezó el 2º período', recurrente({ fechaInicio: '2026-01-31' }), fecha(2026, 2, 28), 2],
    ['31/01 → 27/02 sigue en el 1º', recurrente({ fechaInicio: '2026-01-31' }), fecha(2026, 2, 27), 1],
  ])('%s', (_caso, p, hasta, esperado) => {
    expect(periodosAdeudados(p, hasta)).toBe(esperado)
  })
})

describe('resumenPendiente', () => {
  it('solo descuenta pagos en la moneda del proyecto', () => {
    const r = resumenPendiente(proyecto({ valor: 2000 }), [pago({ monto: 1000 }), pago({ monto: 500000, moneda: 'ARS' })], HOY)
    expect(r).toMatchObject({ moneda: 'USD', adeudado: 2000, pagado: 1000, pendiente: 1000 })
    expect(r.otrasMonedas).toEqual({ ARS: 500000 })
  })

  it('ignora pagos de otros proyectos', () => {
    const r = resumenPendiente(proyecto({ valor: 2000 }), [pago({ proyectoId: 2, monto: 2000 })], HOY)
    expect(r.pendiente).toBe(2000)
  })

  it('recurrente: valor × períodos', () => {
    const r = resumenPendiente(recurrente(), [pago({ monto: 600 })], HOY)
    expect(r).toMatchObject({ adeudado: 900, pagado: 600, pendiente: 300, periodos: 3 })
  })

  it('recurrente sin fecha de inicio cuenta un período', () => {
    expect(resumenPendiente(recurrente({ fechaInicio: null }), [], HOY).adeudado).toBe(300)
  })
})

describe('saldoProyecto', () => {
  const saldo = (valor: number, pagado: number) =>
    saldoProyecto(resumenPendiente(proyecto({ valor }), [pago({ monto: pagado })], HOY))

  it('pendiente', () => expect(saldo(2000, 1500)).toEqual({ tipo: 'PENDIENTE', monto: 500 }))
  it('al día', () => expect(saldo(2000, 2000)).toEqual({ tipo: 'AL_DIA' }))
  it('diferencias de redondeo cuentan como al día', () => expect(saldo(2000, 1999.999)).toEqual({ tipo: 'AL_DIA' }))
  it('a favor', () => expect(saldo(2000, 2100)).toEqual({ tipo: 'A_FAVOR', monto: 100 }))
})

describe('cobroRecurrente', () => {
  it('on-off devuelve null', () => {
    expect(cobroRecurrente(proyecto(), [], HOY)).toBeNull()
  })

  it('mensual: una cuota en el mes y próximo vencimiento', () => {
    const c = cobroRecurrente(recurrente(), [pago({ monto: 600 })], HOY)
    expect(c).toMatchObject({ cuotasEsteMes: 1, montoEsteMes: 300 })
    expect(c?.proximoVencimiento && aIso(c.proximoVencimiento)).toBe('2026-11-15')
    expect(c?.resumen.pendiente).toBe(300)
  })

  it('semanal: cuenta las cuotas que empiezan en el mes (1, 8, 15, 22 y 29 de octubre)', () => {
    const c = cobroRecurrente(recurrente({ fechaInicio: '2026-10-01', frecuenciaPago: 'SEMANAL', valor: 50 }), [], HOY)
    expect(c).toMatchObject({ cuotasEsteMes: 5, montoEsteMes: 250 })
    expect(c?.proximoVencimiento && aIso(c.proximoVencimiento)).toBe('2026-10-29')
  })

  it('anual fuera de su mes: 0 cuotas, vence el año que viene', () => {
    const c = cobroRecurrente(recurrente({ fechaInicio: '2025-03-10', frecuenciaPago: 'ANUAL' }), [], HOY)
    expect(c?.cuotasEsteMes).toBe(0)
    expect(c?.proximoVencimiento && aIso(c.proximoVencimiento)).toBe('2027-03-10')
  })

  it('contrato terminado: sin cuotas ni próximo vencimiento', () => {
    const c = cobroRecurrente(recurrente({ deadline: '2026-10-10' }), [], HOY)
    expect(c).toMatchObject({ cuotasEsteMes: 0, proximoVencimiento: null })
  })
})
