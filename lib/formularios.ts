// Estado que devuelven los server actions de formularios. Sin dependencias de server:
// lo importan también los componentes cliente.
export type EstadoFormulario = {
  error: string | null
  errores: Partial<Record<string, string>>
}

export type AccionFormulario = (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>

export const ESTADO_FORMULARIO_INICIAL: EstadoFormulario = { error: null, errores: {} }
