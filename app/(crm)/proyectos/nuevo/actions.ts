'use server'

import { cookies } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { wpFetch } from '@/lib/wp'

export type NuevoProyectoState = {
  error: string | null
}

export async function crearProyecto(
  _prevState: NuevoProyectoState,
  formData: FormData
): Promise<NuevoProyectoState> {
  const nombre = formData.get('nombre')?.toString().trim()
  if (!nombre) return { error: 'El nombre es obligatorio.' }

  const clienteId = formData.get('cliente_id')?.toString()
  if (!clienteId) return { error: 'El cliente es obligatorio.' }

  const tipoProyecto = formData.get('tipo_proyecto')?.toString() || 'ON_OFF'

  const payload = {
    nombre,
    cliente_id: clienteId,
    estado: formData.get('estado')?.toString() || 'PROSPECTO',
    fecha_inicio: formData.get('fecha_inicio')?.toString() || null,
    deadline: formData.get('deadline')?.toString() || null,
    accion_pendiente: formData.get('accion_pendiente')?.toString() || null,
    tipo_proyecto: tipoProyecto,
    valor: Number(formData.get('valor')?.toString() || 0),
    frecuencia_pago: tipoProyecto === 'RECURRENTE' ? formData.get('frecuencia_pago')?.toString() || 'MENSUAL' : null,
    url: formData.get('url')?.toString() || null,
  }

  const token = (await cookies()).get('hippo_token')?.value

  try {
    await wpFetch('/proyectos', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo guardar el proyecto. Intentá de nuevo.' }
  }

  revalidatePath('/proyectos')
  redirect('/proyectos')
}
