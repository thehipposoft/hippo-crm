'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { enviarAWp } from '@/lib/acciones'
import { ESTADO_VALUES } from '@/lib/types'

const estadoSchema = z.enum(ESTADO_VALUES)

// PUT parcial: WordPress solo actualiza los campos que vienen en el payload
export async function cambiarEstadoProyecto(id: number, estado: string): Promise<{ error: string | null }> {
  const validacion = estadoSchema.safeParse(estado)
  if (!validacion.success) return { error: 'Estado inválido.' }

  const error = await enviarAWp(`/proyectos/${id}`, 'PUT', { estado: validacion.data }, 'No se pudo cambiar el estado.')
  if (error) return { error: error.error }

  revalidatePath('/proyectos')
  revalidatePath(`/proyectos/${id}`)
  revalidatePath('/clientes/[id]', 'page')
  return { error: null }
}
