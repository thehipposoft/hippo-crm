import { describe, expect, it } from 'vitest'
import { fecha, pago, porCasilla, propuesta, proyecto, recurrente, unidad } from '@/lib/test-utils'
import { armarEstadoDeCuenta } from './estadoDeCuenta'
import { aprobacionDe, armarServicios, filtrarServicios } from './servicios'

const HOY = fecha(2026, 11, 17)

const servicios = (...args: Parameters<typeof armarEstadoDeCuenta>) => armarServicios(armarEstadoDeCuenta(...args))

describe('armarServicios', () => {
  it('on-off con pago parcial: saldo, progreso y pagos sin notas', () => {
    const [s] = servicios([proyecto({ valor: 1500 })], [pago({ monto: 750, notas: 'interna' })], HOY)
    expect(s).toMatchObject({ tipo: 'UNICO', adeudado: 1500, pagado: 750, progreso: 0.5, cuotasPendientes: null, proximo: null })
    expect(s.saldo).toEqual({ tipo: 'PENDIENTE', monto: 750 })
    expect(s.pagos).toEqual([{ id: 1, fecha: '2026-10-01', monto: 750, moneda: 'USD', medioPago: 'Transferencia' }])
  })

  it('recurrente: cuotas pendientes y próxima cuota', () => {
    // Desde el 15/08: ago, sep, oct y nov iniciados = 4 × 300; pagó 1
    const [s] = servicios([recurrente()], [pago({ monto: 300 })], HOY)
    expect(s.tipo).toBe('RECURRENTE')
    expect(s.saldo).toEqual({ tipo: 'PENDIENTE', monto: 900 })
    expect(s.cuotasPendientes).toBe(3)
    expect(s.proximo).toEqual({ fecha: fecha(2026, 12, 15), monto: 300 })
  })

  it('un pago parcial de cuota cuenta como cuota pendiente', () => {
    const [s] = servicios([recurrente()], [pago({ monto: 1000 })], HOY)
    expect(s.cuotasPendientes).toBe(1)
  })

  it('por unidad: meses y activas, sin cuotas fijas', () => {
    const [s] = servicios([porCasilla([unidad(), unidad({ id: 2, nombre: 'otra@cliente.com' })])], [], HOY)
    expect(s.tipo).toBe('POR_UNIDAD')
    expect(s.cuotasPendientes).toBeNull()
    expect(s.activas).toEqual(['casilla@cliente.com', 'otra@cliente.com'])
    expect(s.meses?.[0].monto).toBe(10)
    expect(s.proximo?.monto).toBe(10)
  })

  it('pago en otra moneda no descuenta y se informa aparte', () => {
    const [s] = servicios([proyecto({ valor: 1000 })], [pago({ monto: 500, moneda: 'ARS' })], HOY)
    expect(s.saldo).toEqual({ tipo: 'PENDIENTE', monto: 1000 })
    expect(s.otrasMonedas).toEqual({ ARS: 500 })
  })

  it('orden: deuda más grande primero, después al día y los finalizados al final', () => {
    const lista = servicios(
      [
        proyecto({ id: 1, nombre: 'Cerrado', estado: 'CERRADO', valor: 100 }),
        proyecto({ id: 2, nombre: 'Al día', valor: 100 }),
        proyecto({ id: 3, nombre: 'Debe poco', valor: 200 }),
        proyecto({ id: 4, nombre: 'Debe mucho', valor: 900 }),
      ],
      [pago({ id: 1, proyectoId: 1, monto: 100 }), pago({ id: 2, proyectoId: 2, monto: 100 })],
      HOY
    )
    expect(lista.map((s) => s.nombre)).toEqual(['Debe mucho', 'Debe poco', 'Al día', 'Cerrado'])
    expect(lista.find((s) => s.nombre === 'Cerrado')?.finalizado).toBe(true)
  })

  it('pagó de más: a favor, progreso completo', () => {
    const [s] = servicios([proyecto({ valor: 100 })], [pago({ monto: 150 })], HOY)
    expect(s.saldo).toEqual({ tipo: 'A_FAVOR', monto: 50 })
    expect(s.progreso).toBe(1)
  })
})

describe('filtrarServicios', () => {
  const lista = servicios(
    [proyecto({ id: 1, valor: 100 }), proyecto({ id: 2, valor: 100 })],
    [pago({ proyectoId: 1, monto: 100 })],
    HOY
  )
  it('con saldo / al día / todos', () => {
    expect(filtrarServicios(lista, 'CON_SALDO').map((s) => s.id)).toEqual([2])
    expect(filtrarServicios(lista, 'AL_DIA').map((s) => s.id)).toEqual([1])
    expect(filtrarServicios(lista, 'TODOS')).toHaveLength(2)
  })
})

describe('aprobacionDe', () => {
  const base = { id: 5, propuestaEnviada: null, propuestaAprobada: null, propuestaAprobadaPor: null, propuestaMedio: null }

  it('sin propuesta ni registro: nada que mostrar', () => {
    expect(aprobacionDe(base, [])).toBeNull()
  })

  it('propuesta hecha fuera del CRM: fechas, quién y medio del registro manual', () => {
    const r = aprobacionDe({ ...base, propuestaEnviada: '2026-10-20', propuestaAprobada: '2026-10-28', propuestaAprobadaPor: 'Martín Sima', propuestaMedio: 'WHATSAPP' }, [])
    expect(r).toEqual({ enviada: '2026-10-20', aprobada: '2026-10-28', aprobadaPor: 'Martín Sima', medio: 'WHATSAPP', enLink: false, propuesta: null })
  })

  it('aceptada en el link: firma y propuesta del CRM, sin medio manual', () => {
    const p = propuesta({ id: 104, tipo: 'PROPUESTA', titulo: 'Sitio', proyectoId: 5, estado: 'ACEPTADA', token: 't', respuestaNombre: 'Ana López', enviadaEl: '2026-10-20T15:00:00Z', respondidaEl: '2026-10-28T15:00:00Z' })
    const r = aprobacionDe({ ...base, propuestaMedio: 'EMAIL' }, [p])
    expect(r).toEqual({ enviada: '2026-10-20', aprobada: '2026-10-28', aprobadaPor: 'Ana López', medio: null, enLink: true, propuesta: { numero: 'P-000104', titulo: 'Sitio', token: 't' } })
  })

  it('marcada aceptada a mano en el CRM: sin firma', () => {
    const p = propuesta({ proyectoId: 5, estado: 'ACEPTADA', respuestaNombre: null, enviadaEl: '2026-10-20T15:00:00Z', respondidaEl: '2026-10-28T15:00:00Z' })
    expect(aprobacionDe(base, [p])).toMatchObject({ aprobadaPor: null, enLink: false })
  })

  it('enviada y todavía sin respuesta: solo la fecha de envío y el link', () => {
    const p = propuesta({ id: 7, proyectoId: 5, estado: 'ENVIADA', token: 'x', enviadaEl: '2026-11-01T15:00:00Z' })
    expect(aprobacionDe(base, [p])).toMatchObject({ enviada: '2026-11-01', aprobada: null, propuesta: { token: 'x' } })
  })

  it('armarServicios la incluye por proyecto', () => {
    const [s] = armarServicios(
      armarEstadoDeCuenta([proyecto({ id: 5, valor: 100, propuestaAprobada: '2026-10-28', propuestaAprobadaPor: 'Martín' })], [], HOY)
    )
    expect(s.aprobacion).toMatchObject({ aprobada: '2026-10-28', aprobadaPor: 'Martín' })
  })
})
