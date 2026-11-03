'use server'

import { revalidatePath } from 'next/cache'
import { enviarRespuestaPropuesta, type ErrorRespuesta } from '@/lib/publico'
import { respuestaPropuestaSchema } from '@/lib/validations/propuesta'

// Pública: la llama el cliente desde su link. WordPress valida el token, el estado y el vencimiento.
export async function responderPropuesta(token: string, datos: unknown): Promise<{ error: ErrorRespuesta | 'NOMBRE' | null }> {
  const validacion = respuestaPropuestaSchema.safeParse(datos)
  if (!validacion.success) {
    return { error: validacion.error.issues.some((i) => i.path[0] === 'nombre') ? 'NOMBRE' : 'ERROR' }
  }
  const error = await enviarRespuestaPropuesta(token, validacion.data)
  revalidatePath(`/propuesta/${token}`)
  revalidatePath('/propuestas')
  return { error }
}
