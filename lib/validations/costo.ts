import { z } from 'zod'
import { FRECUENCIA_VALUES, MEDIO_PAGO_POR_DEFECTO, MEDIOS_PAGO, MONEDA_POR_DEFECTO, MONEDAS } from '@/lib/types'
import { fechaNoAnterior, fechaOpcional, montoRequerido, opcionConDefault, textoRequerido } from './campos'

export const costoSchema = z
  .object({
    nombre_costo: textoRequerido('El nombre del costo es obligatorio.'),
    monto: montoRequerido,
    moneda: opcionConDefault(MONEDAS, MONEDA_POR_DEFECTO),
    metodo_pago: opcionConDefault(MEDIOS_PAGO, MEDIO_PAGO_POR_DEFECTO),
    frecuencia: opcionConDefault(FRECUENCIA_VALUES, 'MENSUAL'),
    fecha_renovacion: fechaOpcional,
    fecha_inicio: fechaOpcional,
    fecha_baja: fechaOpcional,
  })
  .refine((c) => fechaNoAnterior(c.fecha_inicio, c.fecha_baja), {
    path: ['fecha_baja'],
    error: 'La baja no puede ser anterior al alta.',
  })

export type CostoPayload = z.infer<typeof costoSchema>
