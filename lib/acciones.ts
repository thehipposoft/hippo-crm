import { unstable_rethrow } from 'next/navigation'
import { z } from 'zod'
import { getToken } from './auth'
import type { EstadoFormulario } from './formularios'
import { wpFetch } from './wp'

const MENSAJE_CAMPOS_INVALIDOS = 'Revisá los campos marcados.'

type ResultadoValidacion<T> = { ok: true; datos: T } | { ok: false; estado: EstadoFormulario }

export const validarFormulario = <T>(schema: z.ZodType<T>, formData: FormData): ResultadoValidacion<T> => {
  const resultado = schema.safeParse(Object.fromEntries(formData))
  if (resultado.success) return { ok: true, datos: resultado.data }

  // Primer error por campo; los que no tienen campo van al mensaje general
  const errores: EstadoFormulario['errores'] = {}
  let errorGeneral: string | null = null
  for (const issue of resultado.error.issues) {
    const campo = issue.path[0]
    if (campo === undefined) errorGeneral ??= issue.message
    else errores[String(campo)] ??= issue.message
  }
  return { ok: false, estado: { error: errorGeneral ?? MENSAJE_CAMPOS_INVALIDOS, errores } }
}

// Escribe en WordPress. Devuelve el estado de error, o null si salió bien.
export const enviarAWp = async (
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  datos: unknown,
  mensajeError: string
): Promise<EstadoFormulario | null> => {
  try {
    await wpFetch(path, await getToken(), {
      method,
      body: datos === undefined ? undefined : JSON.stringify(datos),
    })
  } catch (error) {
    unstable_rethrow(error)
    return { error: `${mensajeError} Intentá de nuevo.`, errores: {} }
  }
  return null
}
