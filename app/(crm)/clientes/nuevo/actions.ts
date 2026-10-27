'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp, validarFormulario } from '@/lib/acciones'
import type { EstadoFormulario } from '@/lib/formularios'
import { clienteSchema } from '@/lib/validations/cliente'

export async function crearCliente(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(clienteSchema, formData)
  if (!validacion.ok) return validacion.estado

  const error = await enviarAWp('/clientes', 'POST', validacion.datos, 'No se pudo guardar el cliente.')
  if (error) return error

  revalidatePath('/clientes')
  redirect('/clientes')
}
