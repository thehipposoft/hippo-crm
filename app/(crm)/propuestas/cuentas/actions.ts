'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp, validarFormulario } from '@/lib/acciones'
import type { EstadoFormulario } from '@/lib/formularios'
import { cuentaBancariaSchema } from '@/lib/validations/propuesta'

const LISTADO = '/propuestas/cuentas'

export async function crearCuenta(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(cuentaBancariaSchema, formData)
  if (!validacion.ok) return validacion.estado
  const error = await enviarAWp('/cuentas-bancarias', 'POST', validacion.datos, 'No se pudo guardar.')
  if (error) return error
  revalidatePath(LISTADO)
  redirect(LISTADO)
}

export async function actualizarCuenta(id: string, _estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(cuentaBancariaSchema, formData)
  if (!validacion.ok) return validacion.estado
  const error = await enviarAWp(`/cuentas-bancarias/${id}`, 'PUT', validacion.datos, 'No se pudo guardar.')
  if (error) return error
  revalidatePath(LISTADO)
  redirect(LISTADO)
}

export async function eliminarCuenta(id: number): Promise<{ error: string | null }> {
  const error = await enviarAWp(`/cuentas-bancarias/${id}`, 'DELETE', undefined, 'No se pudo eliminar.')
  if (error) return { error: error.error }
  revalidatePath(LISTADO)
  return { error: null }
}
