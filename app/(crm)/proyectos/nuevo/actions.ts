'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { validarFormulario } from '@/lib/acciones'
import { getToken } from '@/lib/auth'
import type { EstadoFormulario } from '@/lib/formularios'
import { proyectoSchema } from '@/lib/validations/proyecto'
import { wpFetch } from '@/lib/wp'

const PATRON_ID = /^\d+$/

export async function crearProyecto(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(proyectoSchema, formData)
  if (!validacion.ok) return validacion.estado

  let id: number
  try {
    ;({ id } = await wpFetch<{ id: number }>('/proyectos', await getToken(), {
      method: 'POST',
      body: JSON.stringify(validacion.datos),
    }))
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo guardar el proyecto. Intentá de nuevo.', errores: {} }
  }

  // Desde una propuesta aceptada: queda vinculada (sus fechas aparecen en la ficha del proyecto)
  const desde = formData.get('desde_propuesta')
  if (typeof desde === 'string' && PATRON_ID.test(desde)) {
    try {
      await wpFetch(`/propuestas/${desde}`, await getToken(), { method: 'PUT', body: JSON.stringify({ proyecto_id: id }) })
    } catch (error) {
      // El proyecto ya se creó: si falla el vínculo se puede elegir el proyecto desde la propuesta
      unstable_rethrow(error)
    }
    revalidatePath(`/propuestas/${desde}`)
    revalidatePath('/propuestas')
    revalidatePath('/proyectos')
    redirect(`/proyectos/${id}`)
  }

  revalidatePath('/proyectos')
  redirect('/proyectos')
}
