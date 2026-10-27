import { z } from 'zod'

// Bloques reutilizables para validar FormData. La salida ya tiene la forma
// que espera WordPress: vacío → null, números como number, enums validados.

const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/

// FormData manda '' en los campos vacíos: se tratan como "no vino"
const vacioAUndefined = (valor: unknown): unknown => {
  if (typeof valor !== 'string') return valor
  const limpio = valor.trim()
  return limpio === '' ? undefined : limpio
}

const aNumero = (valor: unknown): unknown => {
  const limpio = vacioAUndefined(valor)
  return typeof limpio === 'string' ? Number(limpio.replace(',', '.')) : limpio
}

const opcional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(vacioAUndefined, schema.optional()).transform((v) => v ?? null)

export const textoRequerido = (mensaje: string) =>
  z.preprocess(vacioAUndefined, z.string({ error: mensaje }))

export const textoOpcional = opcional(z.string())

export const emailOpcional = opcional(z.email('Email inválido.'))

export const urlOpcional = opcional(z.url('URL inválida. Tiene que empezar con https://'))

export const fechaOpcional = opcional(z.string().regex(PATRON_FECHA, 'Fecha inválida.'))

export const fechaRequerida = (mensaje: string) =>
  z.preprocess(vacioAUndefined, z.string({ error: mensaje }).regex(PATRON_FECHA, 'Fecha inválida.'))

export const montoRequerido = z.preprocess(
  aNumero,
  z
    .number({ error: (issue) => (issue.input === undefined ? 'El monto es obligatorio.' : 'Monto inválido.') })
    .positive('El monto tiene que ser mayor a 0.')
)

export const montoOpcional = z.preprocess(
  aNumero,
  z.number({ error: 'Monto inválido.' }).min(0, 'No puede ser negativo.').default(0)
)

export const idRequerido = (mensaje: string) =>
  z.preprocess(aNumero, z.number({ error: mensaje }).int(mensaje).positive(mensaje))

export const opcionConDefault = <const T extends readonly [string, ...string[]]>(valores: T, porDefecto: T[number]) => {
  const opciones = z.enum(valores, { error: 'Opción inválida.' })
  return z.preprocess(vacioAUndefined, opciones.default(porDefecto as z.output<typeof opciones>))
}

// Para refine: fechas 'YYYY-MM-DD' se comparan como texto
export const fechaNoAnterior = (desde: string | null, hasta: string | null): boolean =>
  !desde || !hasta || hasta >= desde
