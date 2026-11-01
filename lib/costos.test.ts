import { describe, expect, it } from 'vitest'
import {
  costosDelMes,
  costosPorPagar,
  etiquetaPeriodo,
  inicioDePeriodo,
  montoEsperado,
  opcionesDePeriodo,
  periodoDeFecha,
  periodosDelCosto,
  periodosPendientes,
  resumenPeriodo,
  sugerenciaPagoCosto,
  ultimoPago,
} from './costos'
import { costo, fecha, pagoCosto } from './test-utils'

const HOY = fecha(2026, 11, 1)

describe('períodos', () => {
  it('mensual y semanal: YYYY-MM; anual: YYYY', () => {
    expect(periodoDeFecha({ frecuencia: 'MENSUAL' }, HOY)).toBe('2026-11')
    expect(periodoDeFecha({ frecuencia: 'SEMANAL' }, fecha(2026, 3, 9))).toBe('2026-03')
    expect(periodoDeFecha({ frecuencia: 'ANUAL' }, HOY)).toBe('2026')
  })

  it('etiquetas e inicio', () => {
    expect(etiquetaPeriodo('2026-10')).toBe('Octubre de 2026')
    expect(etiquetaPeriodo('2026')).toBe('2026')
    expect(inicioDePeriodo('2026-10')).toEqual(fecha(2026, 10, 1))
    expect(inicioDePeriodo('2026-13')).toBeNull()
  })

  it('monto esperado: semanal ≈ 4,33 semanas', () => {
    expect(montoEsperado({ frecuencia: 'SEMANAL', monto: 12 })).toBe(52)
    expect(montoEsperado({ frecuencia: 'ANUAL', monto: 120 })).toBe(120)
  })
})

describe('resumenPeriodo', () => {
  const sueldo = costo({ nombreCosto: 'Sueldo Gomi', monto: 1000, categoria: 'SUELDO' })

  it('sin pagos: pendiente', () => {
    expect(resumenPeriodo(sueldo, '2026-10')).toMatchObject({ estado: 'PENDIENTE', pagado: 0, falta: 1000 })
  })

  it('pagado (aunque se pague al mes siguiente: cuenta el período, no la fecha)', () => {
    const c = { ...sueldo, pagos: [pagoCosto({ periodo: '2026-10', fecha: '2026-11-05', monto: 1000 })] }
    expect(resumenPeriodo(c, '2026-10')).toMatchObject({ estado: 'PAGADO', pagado: 1000, falta: 0 })
    expect(resumenPeriodo(c, '2026-11').estado).toBe('PENDIENTE')
  })

  it('parcial: suma varios pagos del período', () => {
    const c = { ...sueldo, pagos: [pagoCosto({ id: 1, monto: 300 }), pagoCosto({ id: 2, monto: 200 })] }
    expect(resumenPeriodo(c, '2026-10')).toMatchObject({ estado: 'PARCIAL', pagado: 500, falta: 500 })
  })

  it('pagar de más también cuenta como pagado', () => {
    const c = { ...sueldo, pagos: [pagoCosto({ monto: 1100 })] }
    expect(resumenPeriodo(c, '2026-10')).toMatchObject({ estado: 'PAGADO', falta: 0 })
  })

  it('pago en otra moneda: período pagado, monto aparte', () => {
    const c = { ...sueldo, pagos: [pagoCosto({ monto: 950000, moneda: 'ARS' })] }
    expect(resumenPeriodo(c, '2026-10')).toMatchObject({ estado: 'PAGADO', pagado: 0, otrasMonedas: { ARS: 950000 } })
  })
})

describe('periodosDelCosto y pendientes', () => {
  it('desde el primer pago hasta el actual, más nuevo primero', () => {
    const c = costo({ fechaInicio: '2026-07-15', pagos: [pagoCosto({ periodo: '2026-08' })] })
    expect(periodosDelCosto(c, HOY)).toEqual(['2026-11', '2026-10', '2026-09', '2026-08'])
  })

  it('nunca antes del alta, aunque haya un pago anterior', () => {
    const c = costo({ fechaInicio: '2026-09-01', pagos: [pagoCosto({ periodo: '2026-05' })] })
    expect(periodosDelCosto(c, HOY)).toEqual(['2026-11', '2026-10', '2026-09'])
  })

  it('costo viejo sin pagos registrados: solo el actual (no inventa deuda)', () => {
    expect(periodosDelCosto(costo({ fechaInicio: '2024-01-01' }), HOY)).toEqual(['2026-11'])
  })

  it('sin alta: desde el primer pago; sin pagos, solo el actual', () => {
    expect(periodosDelCosto(costo({ pagos: [pagoCosto({ periodo: '2026-09' })] }), HOY)).toEqual(['2026-11', '2026-10', '2026-09'])
    expect(periodosDelCosto(costo(), HOY)).toEqual(['2026-11'])
  })

  it('se corta en la baja y como máximo 12', () => {
    const conBaja = costo({ fechaInicio: '2026-01-01', fechaBaja: '2026-03-10', pagos: [pagoCosto({ periodo: '2026-01' })] })
    expect(periodosDelCosto(conBaja, HOY)).toEqual(['2026-03', '2026-02', '2026-01'])
    expect(periodosDelCosto(costo({ fechaInicio: '2020-01-01', pagos: [pagoCosto({ periodo: '2020-01' })] }), HOY)).toHaveLength(12)
  })

  it('incluye períodos pagados por adelantado', () => {
    const c = costo({ fechaInicio: '2026-10-01', pagos: [pagoCosto({ periodo: '2026-12' })] })
    expect(periodosDelCosto(c, HOY)).toEqual(['2026-12', '2026-11'])
  })

  it('anual: un período por año', () => {
    const c = costo({ frecuencia: 'ANUAL', monto: 120, fechaInicio: '2024-03-01', pagos: [pagoCosto({ periodo: '2024' })] })
    expect(periodosDelCosto(c, HOY)).toEqual(['2026', '2025', '2024'])
  })

  it('pendientes: los no pagados hasta hoy, el más viejo primero', () => {
    const c = costo({
      monto: 100,
      fechaInicio: '2026-08-01',
      pagos: [pagoCosto({ periodo: '2026-08', monto: 100 }), pagoCosto({ id: 2, periodo: '2026-10', monto: 40 })],
    })
    expect(periodosPendientes(c, HOY).map((r) => [r.periodo, r.estado, r.falta])).toEqual([
      ['2026-09', 'PENDIENTE', 100],
      ['2026-10', 'PARCIAL', 60],
      ['2026-11', 'PENDIENTE', 100],
    ])
  })
})

describe('sugerenciaPagoCosto', () => {
  it('el pendiente más viejo, con lo que falta', () => {
    const c = costo({ monto: 100, fechaInicio: '2026-10-01', pagos: [pagoCosto({ periodo: '2026-10', monto: 40 })], metodoPago: 'Transferencia' })
    expect(sugerenciaPagoCosto(c, HOY)).toEqual({ periodo: '2026-10', monto: 60, moneda: 'USD', metodoPago: 'Transferencia' })
  })

  it('al día: sugiere el próximo período', () => {
    const c = costo({ monto: 100, fechaInicio: '2026-11-01', pagos: [pagoCosto({ periodo: '2026-11', monto: 100 })] })
    expect(sugerenciaPagoCosto(c, HOY)).toMatchObject({ periodo: '2026-12', monto: 100 })
  })

  it('anual pendiente', () => {
    expect(sugerenciaPagoCosto(costo({ frecuencia: 'ANUAL', monto: 120 }), HOY)).toMatchObject({ periodo: '2026', monto: 120 })
  })
})

describe('otras utilidades', () => {
  it('opciones de período: próximos dos, actual e historial', () => {
    const c = costo({ fechaInicio: '2026-10-01', pagos: [pagoCosto({ periodo: '2026-10' })] })
    expect(opcionesDePeriodo(c, HOY)).toEqual(['2027-01', '2026-12', '2026-11', '2026-10'])
  })

  it('último pago por fecha', () => {
    const c = costo({ pagos: [pagoCosto({ id: 1, fecha: '2026-09-01' }), pagoCosto({ id: 2, fecha: '2026-10-20' }), pagoCosto({ id: 3, fecha: null })] })
    expect(ultimoPago(c)?.id).toBe(2)
    expect(ultimoPago(costo())).toBeNull()
  })
})

describe('costosDelMes (pagado real si hay; si no, estimado)', () => {
  const NOV = fecha(2026, 11, 10)

  it('sin pagos: el estimado (igual que antes)', () => {
    const r = costosDelMes([costo({ monto: 12, frecuencia: 'SEMANAL' }), costo({ monto: 120, frecuencia: 'ANUAL' })], NOV)
    expect(r.map((c) => [c.monto, c.falta, c.estado])).toEqual([
      [52, 52, 'PENDIENTE'],
      [10, 10, 'PENDIENTE'],
    ])
  })

  it('con pago del período: usa lo pagado real', () => {
    const c = costo({ monto: 1000, pagos: [pagoCosto({ periodo: '2026-11', monto: 980 })] })
    expect(costosDelMes([c], NOV)[0]).toMatchObject({ monto: 1000, pagado: 980, falta: 20, estado: 'PARCIAL' })
  })

  it('pagado de más: suma lo pagado', () => {
    const c = costo({ monto: 1000, pagos: [pagoCosto({ periodo: '2026-11', monto: 1050 })] })
    expect(costosDelMes([c], NOV)[0]).toMatchObject({ monto: 1050, pagado: 1050, falta: 0, estado: 'PAGADO' })
  })

  it('anual pagado: lo pagado del año / 12', () => {
    const c = costo({ frecuencia: 'ANUAL', monto: 120, pagos: [pagoCosto({ periodo: '2026', monto: 132 })] })
    expect(costosDelMes([c], NOV)[0]).toMatchObject({ monto: 11, pagado: 11, falta: 0 })
  })

  it('otra moneda: va aparte y no queda faltante', () => {
    const c = costo({ monto: 1000, pagos: [pagoCosto({ periodo: '2026-11', monto: 900000, moneda: 'ARS' })] })
    expect(costosDelMes([c], NOV)[0]).toMatchObject({ monto: 0, falta: 0, otrasMonedas: { ARS: 900000 } })
  })

  it('no cuenta costos dados de baja', () => {
    expect(costosDelMes([costo({ fechaBaja: '2026-09-30' })], NOV)).toEqual([])
  })
})

describe('costosPorPagar', () => {
  it('todos los períodos impagos, el más viejo primero', () => {
    const sueldo = costo({ id: 1, nombreCosto: 'Sueldo', monto: 1000, pagos: [pagoCosto({ periodo: '2026-10', monto: 400 })] })
    const figma = costo({ id: 2, nombreCosto: 'Figma', monto: 15 })
    const aldia = costo({ id: 3, nombreCosto: 'Hosting', pagos: [pagoCosto({ periodo: '2026-11', monto: 999 })] })
    expect(costosPorPagar([sueldo, figma, aldia], HOY).map((p) => [p.costo.nombreCosto, p.resumen.periodo, p.resumen.falta])).toEqual([
      ['Sueldo', '2026-10', 600],
      ['Figma', '2026-11', 15],
      ['Sueldo', '2026-11', 1000],
    ])
  })
})
