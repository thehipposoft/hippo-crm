import type { z } from 'zod'
import type { EstadoFormulario } from '@/lib/formularios'

// Sin dependencias de Next: se testea suelto (lib/acciones.ts lo re-exporta)

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

