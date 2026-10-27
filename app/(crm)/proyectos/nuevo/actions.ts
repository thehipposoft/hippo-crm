'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp, validarFormulario } from '@/lib/acciones'
import type { EstadoFormulario } from '@/lib/formularios'
import { proyectoSchema } from '@/lib/validations/proyecto'

export async function crearProyecto(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(proyectoSchema, formData)
  if (!validacion.ok) return validacion.estado

  const error = await enviarAWp('/proyectos', 'POST', validacion.datos, 'No se pudo guardar el proyecto.')
  if (error) return error

  revalidatePath('/proyectos')
  redirect('/proyectos')
}
