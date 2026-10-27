'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp } from '@/lib/acciones'

// Sin `redirigirA` (desde una tabla) solo refresca; desde la ficha vuelve al listado.
export async function eliminarPago(id: number, redirigirA?: string): Promise<{ error: string | null }> {
  const error = await enviarAWp(`/pagos/${id}`, 'DELETE', undefined, 'No se pudo eliminar el pago.')
  if (error) return { error: error.error }

  revalidatePath('/pagos')
  revalidatePath('/proyectos/[id]', 'page')
  if (redirigirA) redirect(redirigirA)
  return { error: null }
}
