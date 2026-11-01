'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp } from '@/lib/acciones'

// Manda el costo y sus pagos a la papelera de WordPress
export async function eliminarCosto(id: number): Promise<{ error: string | null }> {
  const error = await enviarAWp(`/costos/${id}`, 'DELETE', undefined, 'No se pudo eliminar el costo.')
  if (error) return { error: error.error }

  revalidatePath('/costos')
  revalidatePath('/')
  redirect('/costos')
}
