import { describe, expect, it } from 'vitest'
import { accionesPendientes, datosIncompletos, deadlinesProximos, porCobrar, recurrentesDelMes, renovacionesProximas } from './dashboard'
import { aIso } from './fechas'
import { costo, fecha, pago, proyecto, recurrente } from './test-utils'

const HOY = fecha(2026, 10, 26)

describe('deadlinesProximos', () => {
  it('vencidos y próximos 14 días, más urgente primero; ignora cerrados y lejanos', () => {
    const resultado = deadlinesProximos(
      [
        proyecto({ id: 1, deadline: '2026-10-20' }),
        proyecto({ id: 2, deadline: '2026-11-05' }),
        proyecto({ id: 3, deadline: '2026-11-30' }),
        proyecto({ id: 4, estado: 'CERRADO', deadline: '2026-10-27' }),
        proyecto({ id: 5, estado: 'PROSPECTO', deadline: '2026-10-26' }),
        proyecto({ id: 6, deadline: null }),
      ],
      HOY
    )
    expect(resultado.map((d) => [d.item.id, d.dias])).toEqual([
      [1, -6],
      [5, 0],
      [2, 10],
    ])
  })
})

describe('renovacionesProximas', () => {
  it('corre la fecha cargada hasta la próxima renovación', () => {
    const resultado = renovacionesProximas(
      [
        costo({ id: 1, frecuencia: 'ANUAL', fechaRenovacion: '2025-11-05' }),
        costo({ id: 2, frecuencia: 'MENSUAL', fechaRenovacion: '2026-01-03' }),
        costo({ id: 3, frecuencia: 'ANUAL', fechaRenovacion: '2026-03-01' }),
        costo({ id: 4, frecuencia: 'MENSUAL', fechaRenovacion: '2026-10-30', fechaBaja: '2026-09-30' }),
        costo({ id: 5, fechaRenovacion: null }),
        costo({ id: 6, fechaRenovacion: '2026-10-26' }),
      ],
      HOY
    )
    expect(resultado.map((r) => [r.item.id, aIso(r.fecha)])).toEqual([
      [6, '2026-10-26'],
      [2, '2026-11-03'],
      [1, '2026-11-05'],
    ])
  })

  it('no avisa una renovación posterior a la baja', () => {
    const c = costo({ fechaRenovacion: '2026-11-10', fechaBaja: '2026-10-31' })
    expect(renovacionesProximas([c], HOY)).toEqual([])
  })
})

describe('porCobrar', () => {
  it('solo activos, en pausa y cerrados; totales por moneda', () => {
    const { totales, deudas } = porCobrar(
      [
        proyecto({ id: 1, valor: 100 }),
        proyecto({ id: 2, estado: 'PROSPECTO', valor: 9999 }),
        proyecto({ id: 3, estado: 'CERRADO', valor: 100 }),
        proyecto({ id: 4, valor: 5000, moneda: 'ARS' }),
      ],
      [pago({ proyectoId: 3, monto: 100 })],
      HOY
    )
    expect(totales).toEqual({ USD: 100, ARS: 5000 })
    expect(deudas.map((d) => d.proyecto.id)).toEqual([4, 1])
  })
})

describe('recurrentesDelMes', () => {
  it('solo activos, ordenados por próximo vencimiento', () => {
    const resultado = recurrentesDelMes(
      [
        recurrente({ id: 1, fechaInicio: '2026-08-20' }),
        recurrente({ id: 2, fechaInicio: '2026-07-01' }),
        recurrente({ id: 3, estado: 'EN_PAUSA' }),
        proyecto({ id: 4 }),
        recurrente({ id: 5, deadline: '2026-10-10' }),
      ],
      [],
      HOY
    )
    expect(resultado.map((r) => r.proyecto.id)).toEqual([2, 1, 5])
  })
})

describe('accionesPendientes y datosIncompletos', () => {
  it('acciones solo de proyectos abiertos y con texto', () => {
    const resultado = accionesPendientes([
      proyecto({ id: 1, accionPendiente: 'Llamar' }),
      proyecto({ id: 2, accionPendiente: '   ' }),
      proyecto({ id: 3, estado: 'CERRADO', accionPendiente: 'Nada' }),
    ])
    expect(resultado.map((p) => p.id)).toEqual([1])
  })

  it('detecta datos faltantes (y no mira los perdidos)', () => {
    const resultado = datosIncompletos([
      proyecto({ id: 1, moneda: null }),
      recurrente({ id: 2, fechaInicio: null }),
      proyecto({ id: 3, valor: 0 }),
      proyecto({ id: 4, estado: 'PERDIDO', moneda: null }),
      proyecto({ id: 5 }),
    ])
    expect(resultado.map((d) => [d.proyecto.id, d.motivo])).toEqual([
      [1, 'sin moneda'],
      [2, 'recurrente sin fecha de inicio'],
      [3, 'sin valor'],
    ])
  })
})
