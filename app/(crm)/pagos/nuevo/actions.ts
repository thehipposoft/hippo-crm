'use server'

import { cookies } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { wpFetch } from '@/lib/wp'

export type NuevoPagoState = {
  error: string | null
}

export async function crearPago(
  _prevState: NuevoPagoState,
  formData: FormData
): Promise<NuevoPagoState> {
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
    moneda: formData.get('moneda')?.toString() || 'USD',
    medio_pago: formData.get('medio_pago')?.toString() || null,
    notas: formData.get('notas')?.toString() || null,
  }

  const token = (await cookies()).get('hippo_token')?.value

  try {
    await wpFetch('/pagos', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo guardar el pago. Intentá de nuevo.' }
  }

  revalidatePath('/pagos')
  redirect('/pagos')
}
