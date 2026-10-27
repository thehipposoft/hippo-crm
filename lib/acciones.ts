import { unstable_rethrow } from 'next/navigation'
import { getToken } from './auth'
import type { EstadoFormulario } from './formularios'
export { validarFormulario } from './validations/validar'
import { wpFetch } from './wp'

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
