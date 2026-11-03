'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp, validarFormulario } from '@/lib/acciones'
import type { EstadoFormulario } from '@/lib/formularios'
import { plantillaSchema } from '@/lib/validations/propuesta'

const LISTADO = '/propuestas/plantillas'

export async function crearPlantilla(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(plantillaSchema, formData)
  if (!validacion.ok) return validacion.estado
  const error = await enviarAWp('/plantillas', 'POST', validacion.datos, 'No se pudo guardar.')
  if (error) return error
  revalidatePath(LISTADO)
  redirect(LISTADO)
}

export async function actualizarPlantilla(id: string, _estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(plantillaSchema, formData)
  if (!validacion.ok) return validacion.estado
  const error = await enviarAWp(`/plantillas/${id}`, 'PUT', validacion.datos, 'No se pudo guardar.')
  if (error) return error
  revalidatePath(LISTADO)
  redirect(LISTADO)
}

export async function eliminarPlantilla(id: number): Promise<{ error: string | null }> {
  const error = await enviarAWp(`/plantillas/${id}`, 'DELETE', undefined, 'No se pudo eliminar.')
  if (error) return { error: error.error }
  revalidatePath(LISTADO)
  return { error: null }
}
