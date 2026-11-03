import { describe, expect, it } from 'vitest'
import { clienteSchema } from './cliente'
import { costoSchema } from './costo'
import { pagoSchema } from './pago'
import { proyectoSchema } from './proyecto'
import { cuentaBancariaSchema, propuestaSchema, respuestaPropuestaSchema } from './propuesta'
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

describe('proyectoSchema: cobro por unidad', () => {
  const base = { nombre: 'Casillas', cliente_id: '3', tipo_proyecto: 'RECURRENTE', frecuencia_pago: 'MENSUAL' }

  it('acepta la unidad en recurrentes mensuales (en minúscula)', () => {
    const r = validarFormulario(proyectoSchema, formData({ ...base, unidad: 'Casilla' }))
    expect(r.ok && r.datos.unidad).toBe('casilla')
  })

  it('rechaza unidad con frecuencia no mensual', () => {
    const r = validarFormulario(proyectoSchema, formData({ ...base, frecuencia_pago: 'ANUAL', unidad: 'casilla' }))
    expect(errores(r)).toEqual({ unidad: 'El cobro por unidad es solo para proyectos recurrentes mensuales.' })
  })

  it('on-off ignora la unidad', () => {
    const r = validarFormulario(proyectoSchema, formData({ nombre: 'Web', cliente_id: '3', tipo_proyecto: 'ON_OFF', unidad: '' }))
    expect(r.ok && r.datos.unidad).toBeNull()
  })
})

describe('unidades', () => {
  it('alta múltiple: separa por línea o coma, saca vacíos y repetidos', async () => {
    const { unidadesNuevasSchema } = await import('./unidad')
    const r = validarFormulario(
      unidadesNuevasSchema,
      formData({ nombres: 'ana@acme.com\n\n juan@acme.com, ana@acme.com;luz@acme.com ', fecha_alta: '2026-10-01' })
    )
    expect(r.ok && r.datos.nombres).toEqual(['ana@acme.com', 'juan@acme.com', 'luz@acme.com'])
  })

  it('alta múltiple vacía', async () => {
    const { unidadesNuevasSchema } = await import('./unidad')
    expect(errores(validarFormulario(unidadesNuevasSchema, formData({ nombres: ' \n ', fecha_alta: '2026-10-01' })))).toEqual({
      nombres: 'Cargá al menos una.',
    })
  })

  it('la baja no puede ser anterior al alta', async () => {
    const { unidadSchema } = await import('./unidad')
    const r = validarFormulario(unidadSchema, formData({ nombre: 'a', fecha_alta: '2026-05-01', fecha_baja: '2026-04-30' }))
    expect(errores(r)).toEqual({ fecha_baja: 'La baja no puede ser anterior al alta.' })
  })
})

describe('tareaSchema', () => {
  it('defaults y vacíos → null', async () => {
    const { tareaSchema } = await import('./tarea')
    const r = validarFormulario(tareaSchema, formData({ titulo: 'Definir hosting', responsable_id: '', proyecto_id: '', fecha_limite: '' }))
    expect(r.ok && r.datos).toEqual({
      titulo: 'Definir hosting',
      descripcion: null,
      estado: 'PENDIENTE',
      prioridad: 'MEDIA',
      responsable_id: null,
      proyecto_id: null,
      fecha_limite: null,
    })
  })

  it('convierte ids y valida estado', async () => {
    const { tareaSchema } = await import('./tarea')
    const ok = validarFormulario(tareaSchema, formData({ titulo: 'x', responsable_id: '3', proyecto_id: '10', estado: 'EN_CURSO' }))
    expect(ok.ok && [ok.datos.responsable_id, ok.datos.proyecto_id, ok.datos.estado]).toEqual([3, 10, 'EN_CURSO'])
    expect(errores(validarFormulario(tareaSchema, formData({ titulo: ' ', estado: 'LISTO' })))).toEqual({
      titulo: 'El título es obligatorio.',
      estado: 'Opción inválida.',
    })
  })
})

describe('costoSchema: categoría', () => {
  it('categoría opcional y validada', () => {
    const ok = validarFormulario(costoSchema, formData({ nombre_costo: 'Sueldo Gomi', monto: '1000', categoria: 'SUELDO' }))
    expect(ok.ok && ok.datos.categoria).toBe('SUELDO')
    const vacia = validarFormulario(costoSchema, formData({ nombre_costo: 'Figma', monto: '15', categoria: '' }))
    expect(vacia.ok && vacia.datos.categoria).toBeNull()
    expect(errores(validarFormulario(costoSchema, formData({ nombre_costo: 'x', monto: '1', categoria: 'COMIDA' })))).toEqual({
      categoria: 'Opción inválida.',
    })
  })
})

describe('pagoCostoSchema', () => {
  it('convierte y valida el período', async () => {
    const { pagoCostoSchema } = await import('./pagoCosto')
    const r = validarFormulario(pagoCostoSchema, formData({ fecha: '2026-11-05', periodo: '2026-10', monto: '1.000,50'.replace('.', ''), moneda: 'USD', metodo_pago: 'Transferencia', notas: '' }))
    expect(r.ok && r.datos).toEqual({ fecha: '2026-11-05', periodo: '2026-10', monto: 1000.5, moneda: 'USD', metodo_pago: 'Transferencia', notas: null })
    expect(errores(validarFormulario(pagoCostoSchema, formData({ fecha: '', periodo: '2026-13', monto: '' })))).toEqual({
      fecha: 'La fecha de pago es obligatoria.',
      periodo: 'Período inválido.',
      monto: 'El monto es obligatorio.',
    })
  })
})

describe('propuestaSchema', () => {
  const base = {
    titulo: 'Sitio web',
    cliente_id: '3',
    proyecto_id: '',
    fecha: '2026-11-03',
    fecha_vencimiento: '2026-11-18',
    descuento: '',
    items: JSON.stringify([{ descripcion: ' Diseño ', detalle: '', plazo: '1 mes', cantidad: '2', precio: '375,5' }]),
    secciones: JSON.stringify([{ titulo: 'Alcance', contenido: '- uno' }]),
    cuentas: JSON.stringify([4]),
  }

  it('arma el payload con JSON parseado y valores por defecto', () => {
    const r = validarFormulario(propuestaSchema, formData(base))
    expect(r.ok && r.datos).toMatchObject({
      tipo: 'PROPUESTA',
      idioma: 'es',
      moneda: 'USD',
      cliente_id: 3,
      proyecto_id: null,
      descuento: 0,
      items: [{ descripcion: 'Diseño', detalle: null, plazo: '1 mes', cantidad: 2 }],
      cuentas: [4],
    })
  })

  it('ítems: mensaje con el número del ítem', () => {
    const r = validarFormulario(propuestaSchema, formData({ ...base, items: JSON.stringify([{ descripcion: 'a', cantidad: 1, precio: 1 }, { descripcion: '', cantidad: 1, precio: 1 }]) }))
    expect(!r.ok && r.estado.errores.items).toBe('Ítem 2: falta la descripción.')
  })

  it('sin ítems, sin cliente y vencimiento anterior', () => {
    const r = validarFormulario(propuestaSchema, formData({ ...base, items: '[]', cliente_id: '', fecha_vencimiento: '2026-11-01' }))
    expect(!r.ok && r.estado.errores).toMatchObject({ items: 'Agregá al menos un ítem.', cliente_id: 'Elegí un cliente.' })
  })

  it('JSON roto', () => {
    const r = validarFormulario(propuestaSchema, formData({ ...base, secciones: '{no' }))
    expect(!r.ok && r.estado.errores.secciones).toBe('Secciones inválidas.')
  })
})

describe('respuestaPropuestaSchema', () => {
  it('aceptar pide nombre; rechazar no', () => {
    expect(respuestaPropuestaSchema.safeParse({ accion: 'ACEPTAR', nombre: '  ' }).success).toBe(false)
    expect(respuestaPropuestaSchema.safeParse({ accion: 'RECHAZAR' }).success).toBe(true)
    expect(respuestaPropuestaSchema.safeParse({ accion: 'BORRAR', nombre: 'x' }).success).toBe(false)
  })
})

describe('cuentaBancariaSchema', () => {
  it('moneda opcional', () => {
    const r = validarFormulario(cuentaBancariaSchema, formData({ nombre: 'PayPal', moneda: '', detalle: '@hippo' }))
    expect(r.ok && r.datos).toEqual({ nombre: 'PayPal', moneda: null, detalle: '@hippo' })
  })
})
