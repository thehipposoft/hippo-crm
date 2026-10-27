import { z } from 'zod'
import { emailOpcional, textoOpcional, textoRequerido } from './campos'

export const clienteSchema = z.object({
  nombre: textoRequerido('El nombre es obligatorio.'),
  contacto: textoOpcional,
  telefono: textoOpcional,
  email_contacto: emailOpcional,
  pais: textoOpcional,
})

export type ClientePayload = z.infer<typeof clienteSchema>
