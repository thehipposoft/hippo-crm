'use server'

import { cookies } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { wpFetch } from '@/lib/wp'

export type EditarClienteState = {
  error: string | null
}

export async function actualizarCliente(
  id: string,
  _prevState: EditarClienteState,
  formData: FormData
): Promise<EditarClienteState> {
  const nombre = formData.get('nombre')?.toString().trim()
  if (!nombre) return { error: 'El nombre es obligatorio.' }

  const payload = {
    nombre,
    empresa: formData.get('empresa')?.toString() || null,
  }

  const token = (await cookies()).get('hippo_token')?.value

  try {
    await wpFetch(`/clientes/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo actualizar el cliente. Intentá de nuevo.' }
  }

  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
  redirect(`/clientes/${id}`)
}
