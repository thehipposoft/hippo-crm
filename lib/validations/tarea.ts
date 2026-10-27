import { z } from 'zod'
import { ESTADO_TAREA_VALUES, PRIORIDAD_VALUES } from '@/lib/types'
import { fechaOpcional, opcionConDefault, textoOpcional, textoRequerido } from './campos'

// ID opcional: vacío → null (para quitar responsable o proyecto)
const idOpcional = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() !== '' ? Number(v) : undefined),
  z.number({ error: 'Opción inválida.' }).int().positive('Opción inválida.').optional()
).transform((v) => v ?? null)

export const tareaSchema = z.object({
  titulo: textoRequerido('El título es obligatorio.'),
  descripcion: textoOpcional,
  estado: opcionConDefault(ESTADO_TAREA_VALUES, 'PENDIENTE'),
  prioridad: opcionConDefault(PRIORIDAD_VALUES, 'MEDIA'),
  responsable_id: idOpcional,
  proyecto_id: idOpcional,
  fecha_limite: fechaOpcional,
})

export type TareaPayload = z.infer<typeof tareaSchema>
