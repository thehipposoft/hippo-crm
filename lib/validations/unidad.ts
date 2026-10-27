import { z } from 'zod'
import { fechaNoAnterior, fechaOpcional, fechaRequerida, textoOpcional, textoRequerido } from './campos'

const MAX_UNIDADES_POR_CARGA = 200

// Alta de varias unidades de una vez: una por línea (o separadas por coma)
export const unidadesNuevasSchema = z.object({
  nombres: textoRequerido('Cargá al menos una.')
    .transform((texto) => [...new Set(texto.split(/[\n,;]+/).map((n) => n.trim()).filter(Boolean))])
    .refine((lista) => lista.length > 0, 'Cargá al menos una.')
    .refine((lista) => lista.length <= MAX_UNIDADES_POR_CARGA, `Máximo ${MAX_UNIDADES_POR_CARGA} por vez.`),
  fecha_alta: fechaRequerida('La fecha de alta es obligatoria.'),
  notas: textoOpcional,
})

export const unidadSchema = z
  .object({
    nombre: textoRequerido('El nombre es obligatorio.'),
    fecha_alta: fechaRequerida('La fecha de alta es obligatoria.'),
    fecha_baja: fechaOpcional,
    notas: textoOpcional,
  })
  .refine((u) => fechaNoAnterior(u.fecha_alta, u.fecha_baja), {
    path: ['fecha_baja'],
    error: 'La baja no puede ser anterior al alta.',
  })
