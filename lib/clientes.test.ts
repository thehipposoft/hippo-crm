import { describe, expect, it } from 'vitest'
import { pagosDelCliente, resumenCliente } from './clientes'
import { fecha, pago, proyecto, recurrente } from './test-utils'

const HOY = fecha(2026, 10, 26)

describe('resumenCliente', () => {
  const proyectos = [proyecto({ id: 1, valor: 2000 }), recurrente({ id: 2, valor: 300 })]
  const pagos = [
    pago({ id: 1, proyectoId: 1, fecha: '2025-12-20', monto: 500 }),
    pago({ id: 2, proyectoId: 1, fecha: '2026-03-01', monto: 1000 }),
    pago({ id: 3, proyectoId: 2, fecha: '2026-09-15', monto: 600 }),
    pago({ id: 4, proyectoId: 99, fecha: '2026-10-01', monto: 7777 }),
    pago({ id: 5, proyectoId: 1, fecha: '2026-10-02', monto: 100000, moneda: 'ARS' }),
  ]

  it('solo usa pagos de sus proyectos, más nuevo primero', () => {
    expect(pagosDelCliente(proyectos, pagos).map((p) => p.id).sort()).toEqual([1, 2, 3, 5])
    expect(resumenCliente(proyectos, pagos, HOY).pagos.map((p) => p.id)).toEqual([5, 3, 2, 1])
  })

  it('cobrado total y del año, por moneda', () => {
    const r = resumenCliente(proyectos, pagos, HOY)
    expect(r.cobradoTotal).toEqual({ USD: 2100, ARS: 100000 })
    expect(r.cobradoEsteAnio).toEqual({ USD: 1600, ARS: 100000 })
  })

  it('por cobrar y recurrentes', () => {
    const r = resumenCliente(proyectos, pagos, HOY)
    // Proyecto 1: 2000 − 1500 = 500. Recurrente: 3 cuotas (900) − 600 = 300
    expect(r.porCobrar.totales).toEqual({ USD: 800 })
    expect(r.recurrentes.map((c) => c.proyecto.id)).toEqual([2])
  })
})
