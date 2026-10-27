import { describe, expect, it } from 'vitest'
import { aIso } from './fechas'
import { cobroRecurrente, resumenPendiente, sugerenciaPago } from './proyectos'
import { fecha, pago, porCasilla, recurrente, unidad } from './test-utils'
import { activasEn, activasEsteMes, cobraPorUnidad, detallePorMes, mesesFacturables, unidadActivaEn } from './unidades'

const HOY = fecha(2026, 10, 26)

describe('unidadActivaEn (mes completo)', () => {
  const u = unidad({ fechaAlta: '2026-03-20', fechaBaja: '2026-06-05' })

  it.each([
    [fecha(2026, 2, 1), false, 'antes del alta'],
    [fecha(2026, 3, 1), true, 'mes del alta (aunque sea el 20)'],
    [fecha(2026, 5, 1), true, 'en el medio'],
    [fecha(2026, 6, 1), true, 'mes de la baja (aunque sea el 5)'],
    [fecha(2026, 7, 1), false, 'después de la baja'],
  ])('%o → %s (%s)', (mes, esperado) => {
    expect(unidadActivaEn(u, mes)).toBe(esperado)
  })

  it('sin fecha de alta no cuenta', () => {
    expect(unidadActivaEn(unidad({ fechaAlta: null }), fecha(2026, 5, 1))).toBe(false)
  })

  it('sin baja sigue activa', () => {
    expect(unidadActivaEn(unidad({ fechaAlta: '2020-01-01' }), fecha(2030, 1, 1))).toBe(true)
  })
})

describe('casillas por mes', () => {
  // Ene: 2 · Feb: 2 · Mar: 3 · Abr: 2 (una baja en marzo) · ... · Oct: 2
  const unidades = [
    unidad({ id: 1, fechaAlta: '2026-01-01' }),
    unidad({ id: 2, fechaAlta: '2026-01-15' }),
    unidad({ id: 3, fechaAlta: '2026-03-02', fechaBaja: '2026-03-31' }),
    unidad({ id: 4, fechaAlta: '2026-11-01' }),
  ]
  const proyecto = porCasilla(unidades)

  it('cobraPorUnidad solo con recurrente y unidad', () => {
    expect(cobraPorUnidad(proyecto)).toBe(true)
    expect(cobraPorUnidad(recurrente({ unidad: null }))).toBe(false)
    expect(cobraPorUnidad(porCasilla([], { tipoProyecto: 'ON_OFF' }))).toBe(false)
  })

  it('meses facturables: de enero al mes actual', () => {
    const meses = mesesFacturables(proyecto, HOY)
    expect(meses).toHaveLength(10)
    expect(aIso(meses[0])).toBe('2026-01-01')
    expect(aIso(meses[9])).toBe('2026-10-01')
  })

  it('detalle por mes: activas y monto', () => {
    const detalle = detallePorMes(proyecto, HOY)
    expect(detalle.map((m) => m.activas)).toEqual([2, 2, 3, 2, 2, 2, 2, 2, 2, 2])
    expect(detalle[2].monto).toBe(15)
    expect(detalle.map((m) => [m.altas, m.bajas])).toEqual([
      [2, 0], [0, 0], [1, 1], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0],
    ])
  })

  it('adeudado = suma de cada mes; descuenta pagos', () => {
    // 2×10 meses + 1 extra en marzo = 21 casilla-mes × USD 5
    const r = resumenPendiente(proyecto, [pago({ monto: 80 })], HOY)
    expect(r.adeudado).toBe(105)
    expect(r.pendiente).toBe(25)
    expect(r.periodos).toBe(10)
  })

  it('activas este mes y lo que toca cobrar', () => {
    expect(activasEsteMes(proyecto, HOY)).toBe(2)
    const cobro = cobroRecurrente(proyecto, [], HOY)
    expect(cobro).toMatchObject({ unidadesEsteMes: 2, montoEsteMes: 10, cuotasEsteMes: 1 })
    expect(cobro?.proximoVencimiento && aIso(cobro.proximoVencimiento)).toBe('2026-11-01')
  })

  it('sugerencia de pago: casillas activas × precio', () => {
    expect(sugerenciaPago(proyecto, [], HOY)).toEqual({ moneda: 'USD', monto: 10, origen: 'CUOTA' })
  })

  it('una casilla dada de alta hoy suma este mes completo', () => {
    const conAlta = porCasilla([...unidades, unidad({ id: 5, fechaAlta: '2026-10-26' })])
    expect(activasEsteMes(conAlta, HOY)).toBe(3)
  })
})

describe('bordes', () => {
  it('sin fecha de inicio arranca en la primera alta', () => {
    const p = porCasilla([unidad({ fechaAlta: '2026-08-10' })], { fechaInicio: null })
    expect(mesesFacturables(p, HOY).map(aIso)).toEqual(['2026-08-01', '2026-09-01', '2026-10-01'])
  })

  it('sin inicio ni casillas: no se cobra nada', () => {
    const p = porCasilla([], { fechaInicio: null })
    expect(resumenPendiente(p, [], HOY).adeudado).toBe(0)
    expect(cobroRecurrente(p, [], HOY)).toBeNull()
  })

  it('deadline pasado corta los meses y no hay cobro este mes', () => {
    const p = porCasilla([unidad({ fechaAlta: '2026-01-01' })], { deadline: '2026-06-15' })
    expect(mesesFacturables(p, HOY)).toHaveLength(6)
    expect(activasEsteMes(p, HOY)).toBeNull()
    expect(cobroRecurrente(p, [], HOY)).toMatchObject({ montoEsteMes: 0, proximoVencimiento: null })
  })

  it('activasEn filtra la lista', () => {
    const lista = [unidad({ id: 1 }), unidad({ id: 2, fechaBaja: '2026-02-28' })]
    expect(activasEn(lista, fecha(2026, 3, 1)).map((u) => u.id)).toEqual([1])
  })
})
