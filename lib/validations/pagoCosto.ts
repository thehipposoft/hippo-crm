import { z } from 'zod'
import { MEDIO_PAGO_POR_DEFECTO, MEDIOS_PAGO, MONEDA_POR_DEFECTO, MONEDAS } from '@/lib/types'
import { fechaRequerida, montoRequerido, opcionConDefault, textoOpcional, textoRequerido } from './campos'

const PATRON_PERIODO = /^\d{4}(-(0[1-9]|1[0-2]))?$/

export const pagoCostoSchema = z.object({
  fecha: fechaRequerida('La fecha de pago es obligatoria.'),
  periodo: textoRequerido('El período es obligatorio.').pipe(z.string().regex(PATRON_PERIODO, 'Período inválido.')),
  monto: montoRequerido,
  moneda: opcionConDefault(MONEDAS, MONEDA_POR_DEFECTO),
  metodo_pago: opcionConDefault(MEDIOS_PAGO, MEDIO_PAGO_POR_DEFECTO),
  notas: textoOpcional,
})

export type PagoCostoPayload = z.infer<typeof pagoCostoSchema>
