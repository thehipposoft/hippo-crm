'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { enviarAWp, validarFormulario } from '@/lib/acciones'
import { destinoSeguro, type EstadoFormulario } from '@/lib/formularios'
import { ESTADO_TAREA_VALUES } from '@/lib/types'
import { tareaSchema } from '@/lib/validations/tarea'

const refrescar = (proyectoId?: number | null) => {
  revalidatePath('/tareas')
  revalidatePath('/')
  if (proyectoId) revalidatePath(`/proyectos/${proyectoId}`)
}

export async function crearTarea(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(tareaSchema, formData)
  if (!validacion.ok) return validacion.estado

  const error = await enviarAWp('/tareas', 'POST', validacion.datos, 'No se pudo guardar la tarea.')
  if (error) return error

  refrescar(validacion.datos.proyecto_id)
  redirect(destinoSeguro(formData.get('volver'), '/tareas'))
}

export async function actualizarTarea(id: string, _estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(tareaSchema, formData)
  if (!validacion.ok) return validacion.estado

  const error = await enviarAWp(`/tareas/${id}`, 'PUT', validacion.datos, 'No se pudo guardar la tarea.')
  if (error) return error

  refrescar(validacion.datos.proyecto_id)
  redirect(destinoSeguro(formData.get('volver'), '/tareas'))
}

const estadoSchema = z.enum(ESTADO_TAREA_VALUES)

// PUT parcial: solo cambia el estado
export async function cambiarEstadoTarea(id: number, estado: string): Promise<{ error: string | null }> {
  const validacion = estadoSchema.safeParse(estado)
  if (!validacion.success) return { error: 'Estado inválido.' }

  const error = await enviarAWp(`/tareas/${id}`, 'PUT', { estado: validacion.data }, 'No se pudo cambiar el estado.')
  if (error) return { error: error.error }

  refrescar()
  revalidatePath('/proyectos/[id]', 'page')
  return { error: null }
}

export async function eliminarTarea(id: number): Promise<{ error: string | null }> {
  const error = await enviarAWp(`/tareas/${id}`, 'DELETE', undefined, 'No se pudo eliminar la tarea.')
  if (error) return { error: error.error }
  refrescar()
  redirect('/tareas')
}
