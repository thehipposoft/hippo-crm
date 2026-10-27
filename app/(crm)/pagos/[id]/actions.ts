'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp } from '@/lib/acciones'

export type EliminarPagoState = {
  error: string | null
}

export async function eliminarPago(id: number): Promise<EliminarPagoState> {
  const error = await enviarAWp(`/pagos/${id}`, 'DELETE', undefined, 'No se pudo eliminar el pago.')
  if (error) return { error: error.error }

  revalidatePath('/pagos')
  redirect('/pagos')
}
