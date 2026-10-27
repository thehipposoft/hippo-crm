import { z } from 'zod'
import { ESTADO_VALUES, FRECUENCIA_VALUES, MONEDA_POR_DEFECTO, MONEDAS, TIPO_PROYECTO_VALUES } from '@/lib/types'
import {
  fechaNoAnterior,
  fechaOpcional,
  idRequerido,
  montoOpcional,
  opcionConDefault,
  textoOpcional,
  textoRequerido,
  urlOpcional,
} from './campos'

export const proyectoSchema = z
  .object({
    nombre: textoRequerido('El nombre es obligatorio.'),
    cliente_id: idRequerido('El cliente es obligatorio.'),
    estado: opcionConDefault(ESTADO_VALUES, 'PROSPECTO'),
    fecha_inicio: fechaOpcional,
    deadline: fechaOpcional,
    accion_pendiente: textoOpcional,
    tipo_proyecto: opcionConDefault(TIPO_PROYECTO_VALUES, 'ON_OFF'),
    valor: montoOpcional,
    moneda: opcionConDefault(MONEDAS, MONEDA_POR_DEFECTO),
    frecuencia_pago: opcionConDefault(FRECUENCIA_VALUES, 'MENSUAL'),
    url: urlOpcional,
  })
  .refine((p) => fechaNoAnterior(p.fecha_inicio, p.deadline), {
    path: ['deadline'],
    error: 'El deadline no puede ser anterior a la fecha de inicio.',
  })
  // La frecuencia solo aplica a recurrentes
  .transform((p) => ({ ...p, frecuencia_pago: p.tipo_proyecto === 'RECURRENTE' ? p.frecuencia_pago : null }))

export type ProyectoPayload = z.infer<typeof proyectoSchema>
