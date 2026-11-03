'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp, validarFormulario } from '@/lib/acciones'
import type { EstadoFormulario } from '@/lib/formularios'
import type { EstadoPropuesta, PropuestaRow } from '@/lib/types'
import { estadoPropuestaSchema, propuestaSchema } from '@/lib/validations/propuesta'
import { wpFetch, wpGet } from '@/lib/wp'
import { getToken } from '@/lib/auth'

const refrescar = (id?: string | number) => {
  revalidatePath('/propuestas')
  if (id) revalidatePath(`/propuestas/${id}`)
  revalidatePath('/')
}

export async function crearPropuesta(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(propuestaSchema, formData)
  if (!validacion.ok) return validacion.estado

  let id: number
  try {
    ;({ id } = await wpFetch<{ id: number }>('/propuestas', await getToken(), {
      method: 'POST',
      body: JSON.stringify(validacion.datos),
    }))
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo guardar. Intentá de nuevo.', errores: {} }
  }
  refrescar()
  redirect(`/propuestas/${id}`)
}

export async function actualizarPropuesta(id: string, _estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(propuestaSchema, formData)
  if (!validacion.ok) return validacion.estado

  const error = await enviarAWp(`/propuestas/${id}`, 'PUT', validacion.datos, 'No se pudo guardar.')
  if (error) return error
  refrescar(id)
  redirect(`/propuestas/${id}`)
}

// Marcar enviada, aceptada a mano (ej. por WhatsApp), rechazada o volver a abrir
export async function cambiarEstadoPropuesta(id: number, estado: EstadoPropuesta): Promise<{ error: string | null }> {
  if (!estadoPropuestaSchema.safeParse(estado).success) return { error: 'Estado inválido.' }
  const error = await enviarAWp(`/propuestas/${id}`, 'PUT', { estado }, 'No se pudo cambiar el estado.')
  if (error) return { error: error.error }
  refrescar(id)
  return { error: null }
}

export async function eliminarPropuesta(id: number): Promise<{ error: string | null }> {
  const error = await enviarAWp(`/propuestas/${id}`, 'DELETE', undefined, 'No se pudo eliminar.')
  if (error) return { error: error.error }
  refrescar()
  redirect('/propuestas')
}

// Copia como borrador nuevo (link nuevo, sin respuesta ni fechas de envío)
export async function duplicarPropuesta(id: number): Promise<{ error: string | null }> {
  let nuevoId: number
  try {
    const p = await wpGet<PropuestaRow>(`/propuestas/${id}`)
    ;({ id: nuevoId } = await wpFetch<{ id: number }>('/propuestas', await getToken(), {
      method: 'POST',
      body: JSON.stringify({
        tipo: p.tipo,
        titulo: `${p.titulo} (copia)`,
        resumen: p.resumen,
        cliente_id: p.clienteId,
        proyecto_id: p.proyectoId,
        idioma: p.idioma,
        moneda: p.moneda,
        descuento: p.descuento,
        secciones: p.secciones,
        items: p.items,
        cuentas: p.cuentas,
        notas: p.notas,
      }),
    }))
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo duplicar.' }
  }
  refrescar()
  redirect(`/propuestas/${nuevoId}/editar`)
}

// Guarda secciones, ítems y condiciones como plantilla reutilizable
export async function guardarComoPlantilla(id: number, nombre: string): Promise<{ error: string | null }> {
  const limpio = nombre.trim()
  if (!limpio) return { error: 'Poné un nombre.' }
  let plantillaId: number
  try {
    const p = await wpGet<PropuestaRow>(`/propuestas/${id}`)
    ;({ id: plantillaId } = await wpFetch<{ id: number }>('/plantillas', await getToken(), {
      method: 'POST',
      body: JSON.stringify({ nombre: limpio, tipo: p.tipo, idioma: p.idioma, secciones: p.secciones, items: p.items, notas: p.notas }),
    }))
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo guardar la plantilla.' }
  }
  revalidatePath('/propuestas/plantillas')
  redirect(`/propuestas/plantillas/${plantillaId}`)
}
