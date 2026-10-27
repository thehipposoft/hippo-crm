'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp, validarFormulario } from '@/lib/acciones'
import { destinoSeguro, type EstadoFormulario } from '@/lib/formularios'
import { pagoSchema } from '@/lib/validations/pago'

export async function crearPago(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const validacion = validarFormulario(pagoSchema, formData)
  if (!validacion.ok) return validacion.estado

  const error = await enviarAWp('/pagos', 'POST', validacion.datos, 'No se pudo guardar el pago.')
  if (error) return error

  revalidatePath('/pagos')
  revalidatePath(`/proyectos/${validacion.datos.proyecto_id}`)
  // Vuelve a donde se abrió el formulario (ficha del proyecto, listado, etc.)
  redirect(destinoSeguro(formData.get('volver'), '/pagos'))
}
