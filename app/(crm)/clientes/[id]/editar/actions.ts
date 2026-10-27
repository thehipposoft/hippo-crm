'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp, validarFormulario } from '@/lib/acciones'
import type { EstadoFormulario } from '@/lib/formularios'
import { clienteSchema } from '@/lib/validations/cliente'

export async function actualizarCliente(
  id: string,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const validacion = validarFormulario(clienteSchema, formData)
  if (!validacion.ok) return validacion.estado

  const error = await enviarAWp(`/clientes/${id}`, 'PUT', validacion.datos, 'No se pudo actualizar el cliente.')
  if (error) return error

  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
  redirect(`/clientes/${id}`)
}
