import { z } from 'zod'
import { MEDIO_PAGO_POR_DEFECTO, MEDIOS_PAGO, MONEDA_POR_DEFECTO, MONEDAS } from '@/lib/types'
import { fechaRequerida, idRequerido, montoRequerido, opcionConDefault, textoOpcional } from './campos'

export const pagoSchema = z.object({
  proyecto_id: idRequerido('El proyecto es obligatorio.'),
  fecha: fechaRequerida('La fecha es obligatoria.'),
  monto: montoRequerido,
  moneda: opcionConDefault(MONEDAS, MONEDA_POR_DEFECTO),
  medio_pago: opcionConDefault(MEDIOS_PAGO, MEDIO_PAGO_POR_DEFECTO),
  notas: textoOpcional,
})

export type PagoPayload = z.infer<typeof pagoSchema>
