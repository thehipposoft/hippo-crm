'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp, validarFormulario } from '@/lib/acciones'
import { destinoSeguro, type EstadoFormulario } from '@/lib/formularios'
import { pagoCostoSchema } from '@/lib/validations/pagoCosto'

const refrescar = (costoId: string | number) => {
  revalidatePath(`/costos/${costoId}`)
  revalidatePath('/costos')
  revalidatePath('/')
}

export async function crearPagoCosto(costoId: string, _estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(pagoCostoSchema, formData)
  if (!validacion.ok) return validacion.estado

  const datos = { ...validacion.datos, costo_id: Number(costoId) }
  const error = await enviarAWp('/pagos-costo', 'POST', datos, 'No se pudo guardar el pago.')
  if (error) return error

  refrescar(costoId)
  redirect(destinoSeguro(formData.get('volver'), `/costos/${costoId}`))
}

export async function actualizarPagoCosto(
  costoId: string,
  pagoId: string,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const validacion = validarFormulario(pagoCostoSchema, formData)
  if (!validacion.ok) return validacion.estado

  const error = await enviarAWp(`/pagos-costo/${pagoId}`, 'PUT', validacion.datos, 'No se pudo guardar el pago.')
  if (error) return error

  refrescar(costoId)
  redirect(`/costos/${costoId}`)
}

export async function eliminarPagoCosto(costoId: number, pagoId: number): Promise<{ error: string | null }> {
  const error = await enviarAWp(`/pagos-costo/${pagoId}`, 'DELETE', undefined, 'No se pudo eliminar el pago.')
  if (error) return { error: error.error }
  refrescar(costoId)
  return { error: null }
}
