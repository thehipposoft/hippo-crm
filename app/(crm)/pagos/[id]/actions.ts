'use server'

import { cookies } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { wpFetch } from '@/lib/wp'

export type EliminarPagoState = {
  error: string | null
}

export async function eliminarPago(id: number): Promise<EliminarPagoState> {
  const token = (await cookies()).get('hippo_token')?.value

  try {
    await wpFetch(`/pagos/${id}`, token, { method: 'DELETE' })
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo eliminar el pago. Intentá de nuevo.' }
  }

  revalidatePath('/pagos')
  redirect('/pagos')
}
