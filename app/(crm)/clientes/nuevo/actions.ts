'use server'

import { cookies } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { wpFetch } from '@/lib/wp'

export type NuevoClienteState = {
  error: string | null
}

export async function crearCliente(
  _prevState: NuevoClienteState,
  formData: FormData
): Promise<NuevoClienteState> {
  const nombre = formData.get('nombre')?.toString().trim()
  if (!nombre) return { error: 'El nombre es obligatorio.' }

  const payload = {
    nombre,
    empresa: formData.get('empresa')?.toString() || null,
    email_contacto: formData.get('email_contacto')?.toString() || null,
    pais: formData.get('pais')?.toString() || null,
  }

  const token = (await cookies()).get('hippo_token')?.value

  try {
    await wpFetch('/clientes', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo guardar el cliente. Intentá de nuevo.' }
  }

  revalidatePath('/clientes')
  redirect('/clientes')
}
