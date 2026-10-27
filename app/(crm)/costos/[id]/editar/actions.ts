'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp, validarFormulario } from '@/lib/acciones'
import type { EstadoFormulario } from '@/lib/formularios'
import { costoSchema } from '@/lib/validations/costo'

export async function actualizarCosto(
  id: string,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const validacion = validarFormulario(costoSchema, formData)
  if (!validacion.ok) return validacion.estado

  const error = await enviarAWp(`/costos/${id}`, 'PUT', validacion.datos, 'No se pudo actualizar el costo.')
  if (error) return error

  revalidatePath('/costos')
  revalidatePath(`/costos/${id}`)
  redirect(`/costos/${id}`)
}
