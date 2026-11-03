import { z } from 'zod'
import { ESTADO_PROPUESTA_VALUES, IDIOMA_VALUES, MONEDA_POR_DEFECTO, MONEDAS, TIPO_PROPUESTA_VALUES } from '@/lib/types'
import {
  fechaNoAnterior,
  fechaOpcional,
  fechaRequerida,
  idRequerido,
  montoOpcional,
  opcionConDefault,
  textoOpcional,
  textoRequerido,
} from './campos'

// Ítems, secciones y cuentas llegan como JSON en un input hidden (los arma el editor del form)

const MAX_ITEMS = 100
const MAX_SECCIONES = 40
const MAX_TEXTO_SECCION = 20000

const desdeJson = (valor: unknown): unknown => {
  if (typeof valor !== 'string') return valor
  if (valor.trim() === '') return []
  try {
    return JSON.parse(valor)
  } catch {
    return null
  }
}

const textoLimpio = z.string().transform((v) => v.trim())
const textoONull = z
  .string()
  .nullish()
  .transform((v) => (v?.trim() ? v.trim() : null))

// Acepta coma decimal ("375,5")
const numero = z.preprocess(
  (v) => (typeof v === 'string' ? (v.trim() === '' ? Number.NaN : Number(v.replace(',', '.'))) : v),
  z.number({ error: 'Número inválido.' })
)

const itemSchema = z.object({
  descripcion: textoLimpio,
  detalle: textoONull,
  plazo: textoONull,
  cantidad: numero,
  precio: numero,
})

export const itemsSchema = z.preprocess(
  desdeJson,
  z
    .array(itemSchema, { error: 'Ítems inválidos.' })
    .max(MAX_ITEMS, 'Demasiados ítems.')
    .superRefine((items, ctx) => {
      items.forEach((item, i) => {
        const n = i + 1
        if (!item.descripcion) ctx.addIssue({ code: 'custom', message: `Ítem ${n}: falta la descripción.` })
        else if (!Number.isFinite(item.cantidad) || item.cantidad <= 0) ctx.addIssue({ code: 'custom', message: `Ítem ${n}: la cantidad tiene que ser mayor a 0.` })
        else if (!Number.isFinite(item.precio) || item.precio < 0) ctx.addIssue({ code: 'custom', message: `Ítem ${n}: precio inválido.` })
      })
    })
)

const seccionSchema = z.object({ titulo: textoLimpio, contenido: z.string().max(MAX_TEXTO_SECCION, 'Sección demasiado larga.') })

export const seccionesSchema = z.preprocess(
  desdeJson,
  z
    .array(seccionSchema, { error: 'Secciones inválidas.' })
    .max(MAX_SECCIONES, 'Demasiadas secciones.')
    .superRefine((secciones, ctx) => {
      secciones.forEach((s, i) => {
        if (!s.titulo) ctx.addIssue({ code: 'custom', message: `Sección ${i + 1}: falta el título.` })
      })
    })
)

const cuentasSchema = z.preprocess(desdeJson, z.array(z.number().int().positive(), { error: 'Cuentas inválidas.' }))

export const propuestaSchema = z
  .object({
    tipo: opcionConDefault(TIPO_PROPUESTA_VALUES, 'PROPUESTA'),
    titulo: textoRequerido('El título es obligatorio.'),
    resumen: textoOpcional,
    cliente_id: idRequerido('Elegí un cliente.'),
    proyecto_id: z.preprocess((v) => (v === '' || v === undefined ? null : Number(v)), z.number().int().positive().nullable()),
    idioma: opcionConDefault(IDIOMA_VALUES, 'es'),
    moneda: opcionConDefault(MONEDAS, MONEDA_POR_DEFECTO),
    fecha: fechaRequerida('La fecha es obligatoria.'),
    fecha_vencimiento: fechaOpcional,
    descuento: montoOpcional,
    secciones: seccionesSchema,
    items: itemsSchema.refine((items) => items.length > 0, 'Agregá al menos un ítem.'),
    cuentas: cuentasSchema,
    notas: textoOpcional,
  })
  .refine((p) => fechaNoAnterior(p.fecha, p.fecha_vencimiento), {
    path: ['fecha_vencimiento'],
    error: 'No puede ser anterior a la fecha del documento.',
  })

export type PropuestaPayload = z.infer<typeof propuestaSchema>

export const plantillaSchema = z.object({
  nombre: textoRequerido('El nombre es obligatorio.'),
  tipo: opcionConDefault(TIPO_PROPUESTA_VALUES, 'PROPUESTA'),
  idioma: opcionConDefault(IDIOMA_VALUES, 'es'),
  secciones: seccionesSchema,
  items: itemsSchema,
  notas: textoOpcional,
})

export type PlantillaPayload = z.infer<typeof plantillaSchema>

export const cuentaBancariaSchema = z.object({
  nombre: textoRequerido('El nombre es obligatorio.'),
  moneda: z.preprocess((v) => (v === '' ? null : v), z.enum(MONEDAS, { error: 'Opción inválida.' }).nullable().default(null)),
  detalle: textoRequerido('Cargá los datos de la cuenta.'),
})

export type CuentaBancariaPayload = z.infer<typeof cuentaBancariaSchema>

// Cambio de estado manual desde la ficha
export const estadoPropuestaSchema = z.enum(ESTADO_PROPUESTA_VALUES)

// Respuesta del cliente en el link público
export const MAX_NOMBRE_RESPUESTA = 120
export const MAX_COMENTARIO_RESPUESTA = 2000

export const respuestaPropuestaSchema = z
  .object({
    accion: z.enum(['ACEPTAR', 'RECHAZAR']),
    nombre: z.string().trim().max(MAX_NOMBRE_RESPUESTA).default(''),
    comentario: z.string().trim().max(MAX_COMENTARIO_RESPUESTA).default(''),
  })
  .refine((r) => r.accion === 'RECHAZAR' || r.nombre.length > 0, { path: ['nombre'], error: 'Escribí tu nombre para aceptar.' })
