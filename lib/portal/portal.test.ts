import { describe, expect, it } from 'vitest'
import { armarEstadoDeCuenta } from '@/lib/documentos/estadoDeCuenta'
import { fecha, proyecto, recurrente, unidad } from '@/lib/test-utils'
import type { PropuestaPortal } from '@/lib/types'
import { agruparPropuestas, proximosPagos } from './portal'

const HOY = fecha(2026, 11, 4)

const propuestaPortal = (datos: Partial<PropuestaPortal>): PropuestaPortal => ({
  id: 1,
  tipo: 'PROPUESTA',
  titulo: 'Sitio',
  estado: 'ENVIADA',
  moneda: 'USD',
  fecha: '2026-11-01',
  fechaVencimiento: null,
  descuento: 0,
  items: [{ descripcion: 'a', detalle: null, plazo: null, cantidad: 2, precio: 100 }],
  token: 'x'.repeat(64),
  respondidaEl: null,
  vencida: false,
  ...datos,
})

describe('proximosPagos', () => {
  it('una cuota por recurrente, ordenadas por fecha; por unidad = activas × precio', () => {
    const mensual = recurrente({ id: 1, nombre: 'Mantenimiento', valor: 50, fechaInicio: '2026-01-20' })
    const casillas = recurrente({
      id: 2,
      nombre: 'Casillas',
      valor: 3,
      fechaInicio: '2026-01-05',
      unidad: 'casilla',
      unidades: [unidad({ id: 1, fechaAlta: '2026-01-05' }), unidad({ id: 2, fechaAlta: '2026-02-01' })],
    })
    const r = proximosPagos(armarEstadoDeCuenta([mensual, casillas, proyecto({ id: 3 })], [], HOY))
    expect(r.map((p) => [p.proyecto, p.fecha, p.monto])).toEqual([
      ['Casillas', fecha(2026, 11, 5), 6],
      ['Mantenimiento', fecha(2026, 11, 20), 50],
    ])
  })
})

describe('agruparPropuestas', () => {
  it('pendientes = enviadas sin vencer; el resto aparte, con total', () => {
    const r = agruparPropuestas(
      [
        propuestaPortal({ id: 1 }),
        propuestaPortal({ id: 2, estado: 'ACEPTADA' }),
        propuestaPortal({ id: 3, fechaVencimiento: '2026-11-03' }),
        propuestaPortal({ id: 4, descuento: 50, fecha: '2026-11-02' }),
      ],
      HOY
    )
    expect(r.pendientes.map((p) => [p.id, p.total])).toEqual([
      [4, 150],
      [1, 200],
    ])
    expect(r.resto.map((p) => [p.id, p.vencida])).toEqual([
      [3, true],
      [2, false],
    ])
  })
})
