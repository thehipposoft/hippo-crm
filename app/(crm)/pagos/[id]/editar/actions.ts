'use server'

import { cookies } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { wpFetch } from '@/lib/wp'

export type EditarPagoState = {
  error: string | null
}

export async function actualizarPago(
  id: string,
  _prevState: EditarPagoState,
  formData: FormData
): Promise<EditarPagoState> {
  const proyectoId = formData.get('proyecto_id')?.toString()
  if (!proyectoId) return { error: 'El proyecto es obligatorio.' }

  const fecha = formData.get('fecha')?.toString()
  if (!fecha) return { error: 'La fecha es obligatoria.' }

  const montoRaw = formData.get('monto')?.toString()
  if (!montoRaw) return { error: 'El monto es obligatorio.' }

  const payload = {
    proyecto_id: proyectoId,
    fecha,
    monto: Number(montoRaw),
    medio_pago: formData.get('medio_pago')?.toString() || null,
    notas: formData.get('notas')?.toString() || null,
  }

  const token = (await cookies()).get('hippo_token')?.value

  try {
    await wpFetch(`/pagos/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo actualizar el pago. Intentá de nuevo.' }
  }

  revalidatePath('/pagos')
  revalidatePath(`/pagos/${id}`)
  redirect(`/pagos/${id}`)
}
