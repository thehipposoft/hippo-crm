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
    // Cobro por unidad: nombre de la unidad (ej. casilla); vacío = cobro normal
    unidad: textoOpcional,
  })
  .refine((p) => fechaNoAnterior(p.fecha_inicio, p.deadline), {
    path: ['deadline'],
    error: 'El deadline no puede ser anterior a la fecha de inicio.',
  })
  .refine((p) => !p.unidad || (p.tipo_proyecto === 'RECURRENTE' && p.frecuencia_pago === 'MENSUAL'), {
    path: ['unidad'],
    error: 'El cobro por unidad es solo para proyectos recurrentes mensuales.',
  })
  // La frecuencia y la unidad solo aplican a recurrentes
  .transform((p) => ({
    ...p,
    frecuencia_pago: p.tipo_proyecto === 'RECURRENTE' ? p.frecuencia_pago : null,
    unidad: p.tipo_proyecto === 'RECURRENTE' ? (p.unidad?.toLowerCase() ?? null) : null,
  }))

export type ProyectoPayload = z.infer<typeof proyectoSchema>
