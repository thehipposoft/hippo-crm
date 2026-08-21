'use server'

import { cookies } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { wpFetch } from '@/lib/wp'

export type EditarCostoState = {
  error: string | null
}

export async function actualizarCosto(
  id: string,
  _prevState: EditarCostoState,
  formData: FormData
): Promise<EditarCostoState> {
  const nombreCosto = formData.get('nombre_costo')?.toString().trim()
  if (!nombreCosto) return { error: 'El nombre del costo es obligatorio.' }

  const montoRaw = formData.get('monto')?.toString()
  if (!montoRaw) return { error: 'El monto es obligatorio.' }

  const payload = {
    nombre_costo: nombreCosto,
    monto: Number(montoRaw),
    moneda: formData.get('moneda')?.toString() || 'USD',
    metodo_pago: formData.get('metodo_pago')?.toString() || null,
    frecuencia: formData.get('frecuencia')?.toString() || 'MENSUAL',
    fecha_renovacion: formData.get('fecha_renovacion')?.toString() || null,
  }

  const token = (await cookies()).get('hippo_token')?.value

  try {
    await wpFetch(`/costos/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo actualizar el costo. Intentá de nuevo.' }
  }

  revalidatePath('/costos')
  revalidatePath(`/costos/${id}`)
  redirect(`/costos/${id}`)
}
