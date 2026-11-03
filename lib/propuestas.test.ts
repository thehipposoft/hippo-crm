import { describe, expect, it } from 'vitest'
import {
  cuentasSugeridas,
  estadoVisible,
  numeroPropuesta,
  PLANTILLAS_BASE,
  plantillaBase,
  propuestasAbiertas,
  totalesPropuesta,
} from './propuestas'
import { fecha, propuesta } from './test-utils'

const HOY = fecha(2026, 11, 3)

describe('totalesPropuesta', () => {
  it('suma cantidad × precio y resta el descuento', () => {
    const items = [
      { descripcion: 'a', detalle: null, plazo: null, cantidad: 2, precio: 150.5 },
      { descripcion: 'b', detalle: null, plazo: null, cantidad: 1, precio: 0.1 },
    ]
    expect(totalesPropuesta(items, 1)).toEqual({ subtotal: 301.1, descuento: 1, total: 300.1 })
  })

  it('el descuento no deja el total negativo', () => {
    expect(totalesPropuesta([{ descripcion: 'a', detalle: null, plazo: null, cantidad: 1, precio: 10 }], 50)).toEqual({ subtotal: 10, descuento: 10, total: 0 })
  })
})

describe('número y estado', () => {
  it('número con prefijo por tipo', () => {
    expect(numeroPropuesta({ id: 123, tipo: 'PROPUESTA' })).toBe('P-000123')
    expect(numeroPropuesta({ id: 7, tipo: 'COTIZACION' })).toBe('C-000007')
  })

  it('una enviada que pasó su fecha está vencida; el día del vencimiento todavía no', () => {
    expect(estadoVisible(propuesta({ estado: 'ENVIADA', fechaVencimiento: '2026-11-02' }), HOY)).toBe('VENCIDA')
    expect(estadoVisible(propuesta({ estado: 'ENVIADA', fechaVencimiento: '2026-11-03' }), HOY)).toBe('ENVIADA')
    expect(estadoVisible(propuesta({ estado: 'ACEPTADA', fechaVencimiento: '2026-01-01' }), HOY)).toBe('ACEPTADA')
  })

  it('abiertas: solo enviadas sin vencer', () => {
    const lista = [
      propuesta({ id: 1, estado: 'ENVIADA' }),
      propuesta({ id: 2, estado: 'BORRADOR' }),
      propuesta({ id: 3, estado: 'ENVIADA', fechaVencimiento: '2026-10-01' }),
    ]
    expect(propuestasAbiertas(lista, HOY).map((p) => p.id)).toEqual([1])
  })
})

describe('plantillas base y cuentas', () => {
  it('hay una por tipo e idioma; la cotización no trae secciones', () => {
    expect(PLANTILLAS_BASE).toHaveLength(4)
    expect(plantillaBase('COTIZACION', 'es').secciones).toEqual([])
    expect(plantillaBase('PROPUESTA', 'en').secciones[0].titulo).toBe('Overview')
  })

  it('cuentas sugeridas por moneda', () => {
    const cuentas = [
      { id: 1, nombre: 'Wise', moneda: 'EUR' as const, detalle: 'x' },
      { id: 2, nombre: 'NAB', moneda: 'AUD' as const, detalle: 'x' },
      { id: 3, nombre: 'PayPal', moneda: null, detalle: 'x' },
    ]
    expect(cuentasSugeridas(cuentas, 'AUD')).toEqual([2])
  })
})
