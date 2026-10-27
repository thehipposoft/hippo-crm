import { describe, expect, it } from 'vitest'
import { fecha, normalizarEspacios, pago, proyecto, recurrente } from '@/lib/test-utils'
import { armarEstadoDeCuenta } from './estadoDeCuenta'
import { fechaDoc, idiomaPara, medioDoc, montoDoc, numeroRecibo } from './idioma'

const HOY = fecha(2026, 10, 26)

describe('idiomaPara', () => {
  it.each([
    ['Argentina', 'es'],
    ['España', 'es'],
    ['México', 'es'],
    ['Australia', 'en'],
    ['United States', 'en'],
    ['Germany', 'en'],
    [null, 'es'],
    ['', 'es'],
  ] as const)('%s → %s', (pais, esperado) => {
    expect(idiomaPara(pais)).toBe(esperado)
  })

  it('el idioma pedido en la URL gana; uno inválido se ignora', () => {
    expect(idiomaPara('Australia', 'es')).toBe('es')
    expect(idiomaPara('Australia', 'fr')).toBe('en')
  })
})

describe('formatos de documentos', () => {
  it('montos con código de moneda, sin ambigüedad', () => {
    expect(normalizarEspacios(montoDoc(1500.5, 'USD', 'es'))).toBe('USD 1.500,50')
    expect(normalizarEspacios(montoDoc(1500.5, 'AUD', 'en'))).toBe('AUD 1,500.50')
  })

  it('fechas largas en cada idioma, sin correrse de día', () => {
    expect(fechaDoc('2026-10-01', 'es')).toBe('1 de octubre de 2026')
    expect(fechaDoc('2026-10-01', 'en')).toBe('October 1, 2026')
    expect(fechaDoc(null, 'en')).toBe('—')
  })

  it('número de recibo y medio de pago traducido', () => {
    expect(numeroRecibo(123)).toBe('R-000123')
    expect(medioDoc('Transferencia', 'en')).toBe('Bank transfer')
    expect(medioDoc('Transferencia', 'es')).toBe('Transferencia')
  })
})

describe('armarEstadoDeCuenta', () => {
  const proyectos = [
    proyecto({ id: 1, valor: 2000 }),
    proyecto({ id: 2, estado: 'PROSPECTO', valor: 9999 }),
    recurrente({ id: 3, valor: 300 }),
    proyecto({ id: 4, valor: 50000, moneda: 'ARS', estado: 'CERRADO' }),
  ]
  const pagos = [
    pago({ id: 1, proyectoId: 1, monto: 2100, fecha: '2026-05-01' }),
    pago({ id: 2, proyectoId: 3, monto: 600, fecha: '2026-09-15' }),
    pago({ id: 3, proyectoId: 2, monto: 100, fecha: '2026-10-10' }),
    pago({ id: 4, proyectoId: 1, monto: 1, moneda: 'EUR', fecha: '2026-06-01' }),
  ]
  const estado = armarEstadoDeCuenta(proyectos, pagos, HOY)

  it('solo proyectos facturables (no prospectos)', () => {
    expect(estado.proyectos.map((l) => l.proyecto.id)).toEqual([1, 3, 4])
  })

  it('totales por moneda: el saldo a favor compensa', () => {
    // USD: 2000 + 900 adeudado; 2100 + 600 pagado → saldo 200
    expect(estado.totales.USD).toEqual({ adeudado: 2900, pagado: 2700, saldo: 200 })
    expect(estado.totales.ARS).toEqual({ adeudado: 50000, pagado: 0, saldo: 50000 })
  })

  it('movimientos: solo de proyectos facturables, más nuevo primero', () => {
    expect(estado.movimientos.map((p) => p.id)).toEqual([2, 4, 1])
  })

  it('avisa pagos en otra moneda y lista próximos vencimientos', () => {
    expect(estado.hayOtrasMonedas).toBe(true)
    expect(estado.proximos.map((c) => c.proyecto.id)).toEqual([3])
  })
})

describe('estado de cuenta con cobro por unidad', () => {
  it('detalle de casillas: últimos meses y activas este mes', async () => {
    const { porCasilla, unidad } = await import('@/lib/test-utils')
    const proyecto = porCasilla([
      unidad({ id: 1, nombre: 'ana@acme.com', fechaAlta: '2026-01-01' }),
      unidad({ id: 2, nombre: 'juan@acme.com', fechaAlta: '2026-01-01', fechaBaja: '2026-05-31' }),
    ])
    const estado = armarEstadoDeCuenta([proyecto], [], HOY)
    expect(estado.unidades).toHaveLength(1)
    const [detalle] = estado.unidades
    expect(detalle.meses).toHaveLength(10)
    expect(detalle.meses[0]).toMatchObject({ activas: 1, monto: 5 })
    expect(detalle.meses.at(-1)).toMatchObject({ activas: 2, monto: 10 })
    expect(detalle.activasEsteMes.map((u) => u.nombre)).toEqual(['ana@acme.com'])
    // 2×5 meses + 1×5 meses = 15 casilla-mes × 5
    expect(estado.totales.USD?.adeudado).toBe(75)
  })

  it('traduce el nombre de la unidad', async () => {
    const { unidadDoc, mesDoc } = await import('./idioma')
    expect(unidadDoc('casilla', 'en', true)).toBe('mailboxes')
    expect(unidadDoc('casilla', 'es', true)).toBe('casillas')
    expect(unidadDoc('licencia', 'en')).toBe('license')
    expect(unidadDoc('cuenta', 'en', true)).toBe('cuentas')
    expect(mesDoc(fecha(2026, 10, 1), 'en')).toBe('October 2026')
    expect(mesDoc(fecha(2026, 10, 1), 'es')).toBe('Octubre de 2026')
  })
})
