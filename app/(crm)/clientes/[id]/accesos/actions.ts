'use server'

import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { z } from 'zod'
import { enviarAWp } from '@/lib/acciones'
import { getToken } from '@/lib/auth'
import { wpFetch } from '@/lib/wp'

type Resultado = { error: string | null; aviso?: string }

const invitacionSchema = z.object({
  nombre: z.string().trim().min(1, 'Poné el nombre.'),
  email: z.email('Email inválido.'),
})


const mensajeDeError = (error: unknown, porDefecto: string): string =>
  /WP API error: 409/.test(String(error)) ? 'Ese email ya tiene acceso al portal (puede ser de otro cliente).' : porDefecto

// Crea el acceso y WordPress manda el email de invitación
export async function invitarAcceso(clienteId: number, nombre: string, email: string): Promise<Resultado> {
  const validacion = invitacionSchema.safeParse({ nombre, email: email.trim().toLowerCase() })
  if (!validacion.success) return { error: validacion.error.issues[0]?.message ?? 'Datos inválidos.' }
  try {
    const { emailEnviado } = await wpFetch<{ emailEnviado: boolean }>(`/clientes/${clienteId}/accesos`, await getToken(), {
      method: 'POST',
      body: JSON.stringify(validacion.data),
    })
    revalidatePath(`/clientes/${clienteId}`)
    return { error: null, aviso: emailEnviado ? undefined : 'Se creó el acceso pero WordPress no pudo mandar el email. Reenviá la invitación.' }
  } catch (error) {
    unstable_rethrow(error)
    return { error: mensajeDeError(error, 'No se pudo crear el acceso.') }
  }
}

export async function reenviarInvitacion(clienteId: number, accesoId: number): Promise<Resultado> {
  try {
    const { emailEnviado } = await wpFetch<{ emailEnviado: boolean }>(`/accesos/${accesoId}/invitacion`, await getToken(), { method: 'POST' })
    revalidatePath(`/clientes/${clienteId}`)
    return { error: emailEnviado ? null : 'WordPress no pudo mandar el email.', aviso: emailEnviado ? 'Invitación reenviada.' : undefined }
  } catch (error) {
    unstable_rethrow(error)
    return { error: /WP API error: 409/.test(String(error)) ? 'Ya creó su contraseña: si la olvidó, que use "¿Olvidaste tu contraseña?" en el portal.' : 'No se pudo reenviar.' }
  }
}

export async function cambiarAcceso(clienteId: number, accesoId: number, activo: boolean): Promise<Resultado> {
  const error = await enviarAWp(`/accesos/${accesoId}`, 'PUT', { activo }, 'No se pudo cambiar el acceso.')
  if (error) return { error: error.error }
  revalidatePath(`/clientes/${clienteId}`)
  return { error: null }
}

export async function eliminarAcceso(clienteId: number, accesoId: number): Promise<Resultado> {
  const error = await enviarAWp(`/accesos/${accesoId}`, 'DELETE', undefined, 'No se pudo eliminar el acceso.')
  if (error) return { error: error.error }
  revalidatePath(`/clientes/${clienteId}`)
  return { error: null }
}
