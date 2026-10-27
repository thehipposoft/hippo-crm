import { describe, expect, it } from 'vitest'
import { clienteSchema } from './cliente'
import { costoSchema } from './costo'
import { pagoSchema } from './pago'
import { proyectoSchema } from './proyecto'
import { validarFormulario } from './validar'

const formData = (campos: Record<string, string>): FormData => {
  const fd = new FormData()
  for (const [k, v] of Object.entries(campos)) fd.append(k, v)
  return fd
}

const errores = (resultado: ReturnType<typeof validarFormulario>) => (resultado.ok ? {} : resultado.estado.errores)

describe('pagoSchema', () => {
  it('convierte el formulario al payload de WordPress', () => {
    const r = validarFormulario(
      pagoSchema,
      formData({ proyecto_id: '12', fecha: '2026-10-01', monto: '1500,50', moneda: 'ARS', medio_pago: 'Efectivo', notas: '  hola\nmundo ' })
    )
    expect(r).toEqual({
      ok: true,
      datos: { proyecto_id: 12, fecha: '2026-10-01', monto: 1500.5, moneda: 'ARS', medio_pago: 'Efectivo', notas: 'hola\nmundo' },
    })
  })

  it('campos vacíos → errores por campo y mensaje general', () => {
    const r = validarFormulario(pagoSchema, formData({ proyecto_id: '', fecha: '', monto: '' }))
    expect(r.ok).toBe(false)
    expect(errores(r)).toEqual({
      proyecto_id: 'El proyecto es obligatorio.',
      fecha: 'La fecha es obligatoria.',
      monto: 'El monto es obligatorio.',
    })
    expect(!r.ok && r.estado.error).toBe('Revisá los campos marcados.')
  })

  it.each([
    ['abc', 'Monto inválido.'],
    ['-5', 'El monto tiene que ser mayor a 0.'],
    ['0', 'El monto tiene que ser mayor a 0.'],
  ])('monto %s → %s', (monto, mensaje) => {
    expect(errores(validarFormulario(pagoSchema, formData({ proyecto_id: '1', fecha: '2026-10-01', monto })))).toEqual({ monto: mensaje })
  })

  it('rechaza monedas que no existen', () => {
    const r = validarFormulario(pagoSchema, formData({ proyecto_id: '1', fecha: '2026-10-01', monto: '1', moneda: 'BTC' }))
    expect(errores(r)).toEqual({ moneda: 'Opción inválida.' })
  })

  it('valores por defecto: USD y Transferencia', () => {
    const r = validarFormulario(pagoSchema, formData({ proyecto_id: '1', fecha: '2026-10-01', monto: '1' }))
    expect(r.ok && r.datos).toMatchObject({ moneda: 'USD', medio_pago: 'Transferencia', notas: null })
  })
})

describe('proyectoSchema', () => {
  const base = { nombre: 'Web', cliente_id: '3' }

  it('on-off: frecuencia null y defaults', () => {
    const r = validarFormulario(proyectoSchema, formData({ ...base, tipo_proyecto: 'ON_OFF', frecuencia_pago: 'MENSUAL', valor: '' }))
    expect(r.ok && r.datos).toMatchObject({
      estado: 'PROSPECTO',
      tipo_proyecto: 'ON_OFF',
      frecuencia_pago: null,
      valor: 0,
      moneda: 'USD',
      fecha_inicio: null,
      url: null,
    })
  })

  it('recurrente conserva la frecuencia', () => {
    const r = validarFormulario(proyectoSchema, formData({ ...base, tipo_proyecto: 'RECURRENTE', frecuencia_pago: 'ANUAL' }))
    expect(r.ok && r.datos.frecuencia_pago).toBe('ANUAL')
  })

  it('deadline anterior al inicio y URL inválida', () => {
    const r = validarFormulario(
      proyectoSchema,
      formData({ ...base, fecha_inicio: '2026-05-01', deadline: '2026-04-01', url: 'foo' })
    )
    expect(errores(r)).toEqual({
      url: 'URL inválida. Tiene que empezar con https://',
      deadline: 'El deadline no puede ser anterior a la fecha de inicio.',
    })
  })

  it('valor negativo', () => {
    expect(errores(validarFormulario(proyectoSchema, formData({ ...base, valor: '-1' })))).toEqual({ valor: 'No puede ser negativo.' })
  })
})

describe('costoSchema y clienteSchema', () => {
  it('la baja no puede ser anterior al alta', () => {
    const r = validarFormulario(
      costoSchema,
      formData({ nombre_costo: 'Figma', monto: '15', fecha_inicio: '2026-05-01', fecha_baja: '2026-01-01' })
    )
    expect(errores(r)).toEqual({ fecha_baja: 'La baja no puede ser anterior al alta.' })
  })

  it('cliente: nombre obligatorio (solo espacios no vale) y email válido', () => {
    const r = validarFormulario(clienteSchema, formData({ nombre: '   ', email_contacto: 'mal' }))
    expect(errores(r)).toEqual({ nombre: 'El nombre es obligatorio.', email_contacto: 'Email inválido.' })
  })

  it('cliente: opcionales vacíos → null', () => {
    const r = validarFormulario(clienteSchema, formData({ nombre: 'Acme', contacto: '', pais: ' ' }))
    expect(r.ok && r.datos).toEqual({ nombre: 'Acme', contacto: null, telefono: null, email_contacto: null, pais: null })
  })
})
