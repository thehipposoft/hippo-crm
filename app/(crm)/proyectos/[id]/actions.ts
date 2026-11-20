'use server'

import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { z } from 'zod'
import { enviarAWp } from '@/lib/acciones'
import { getToken } from '@/lib/auth'
import { ESTADO_VALUES, MEDIO_APROBACION_VALUES, TIPO_ARCHIVO_VALUES } from '@/lib/types'
import { wpFetch } from '@/lib/wp'

const estadoSchema = z.enum(ESTADO_VALUES)

// PUT parcial: WordPress solo actualiza los campos que vienen en el payload
export async function cambiarEstadoProyecto(id: number, estado: string): Promise<{ error: string | null }> {
  const validacion = estadoSchema.safeParse(estado)
  if (!validacion.success) return { error: 'Estado inválido.' }

  const error = await enviarAWp(`/proyectos/${id}`, 'PUT', { estado: validacion.data }, 'No se pudo cambiar el estado.')
  if (error) return { error: error.error }

  revalidatePath('/proyectos')
  revalidatePath(`/proyectos/${id}`)
  revalidatePath('/clientes/[id]', 'page')
  return { error: null }
}

// ==== Propuesta del proyecto: fechas manuales y archivos ====

const fechaOVacio = z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])

const refrescarFicha = (id: number) => {
  revalidatePath(`/proyectos/${id}`)
  revalidatePath('/proyectos')
}

const MAX_APROBADA_POR = 120
const MAX_NOTAS = 2000

const registroSchema = z
  .object({
    enviada: fechaOVacio,
    aprobada: fechaOVacio,
    aprobadaPor: z.string().trim().max(MAX_APROBADA_POR, `Máximo ${MAX_APROBADA_POR} caracteres.`),
    medio: z.union([z.literal(''), z.enum(MEDIO_APROBACION_VALUES)]),
    notas: z.string().trim().max(MAX_NOTAS, `Las notas pueden tener hasta ${MAX_NOTAS} caracteres.`),
  })
  .refine((r) => !r.enviada || !r.aprobada || r.aprobada >= r.enviada, 'La aprobación no puede ser anterior al envío.')

export type RegistroPropuesta = z.input<typeof registroSchema>

// Registro manual (propuestas hechas fuera del CRM): fechas y notas de quién aprobó y por qué medio.
// Vacío = se borra (las fechas vuelven a tomarse del CRM).
export async function guardarRegistroPropuesta(id: number, registro: RegistroPropuesta): Promise<{ error: string | null }> {
  const validacion = registroSchema.safeParse(registro)
  if (!validacion.success) return { error: validacion.error.issues[0]?.message ?? 'Datos inválidos.' }
  const r = validacion.data

  const error = await enviarAWp(
    `/proyectos/${id}`,
    'PUT',
    {
      propuesta_enviada: r.enviada || null,
      propuesta_aprobada: r.aprobada || null,
      propuesta_aprobada_por: r.aprobadaPor || null,
      propuesta_medio: r.medio || null,
      propuesta_notas: r.notas || null,
    },
    'No se pudo guardar el registro de la propuesta.'
  )
  if (error) return { error: error.error }
  refrescarFicha(id)
  return { error: null }
}

// La subida va directo del navegador a WordPress (Netlify corta los requests grandes):
// acá solo se pide la URL con el permiso, que vence en unos minutos.
export async function pedirSubidaArchivo(
  id: number,
  tipo: string
): Promise<{ url: string; maxMb: number; error: null } | { error: string }> {
  const validacion = z.enum(TIPO_ARCHIVO_VALUES).safeParse(tipo)
  if (!validacion.success) return { error: 'Tipo inválido.' }
  try {
    const { url, maxMb } = await wpFetch<{ url: string; maxMb: number }>(`/proyectos/${id}/archivos/ticket`, await getToken(), {
      method: 'POST',
      body: JSON.stringify({ tipo: validacion.data }),
    })
    return { url, maxMb, error: null }
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo preparar la subida. Intentá de nuevo.' }
  }
}

export async function archivoSubido(id: number): Promise<void> {
  refrescarFicha(id)
}

// Link temporal para ver o bajar un archivo privado
export async function pedirDescargaArchivo(archivoId: number): Promise<{ url: string; error: null } | { error: string }> {
  try {
    const { url } = await wpFetch<{ url: string }>(`/archivos/${archivoId}/ticket`, await getToken(), { method: 'POST' })
    return { url, error: null }
  } catch (error) {
    unstable_rethrow(error)
    return { error: 'No se pudo abrir el archivo.' }
  }
}

export async function eliminarArchivo(proyectoId: number, archivoId: number): Promise<{ error: string | null }> {
  const error = await enviarAWp(`/archivos/${archivoId}`, 'DELETE', undefined, 'No se pudo eliminar el archivo.')
  if (error) return { error: error.error }
  refrescarFicha(proyectoId)
  return { error: null }
}
