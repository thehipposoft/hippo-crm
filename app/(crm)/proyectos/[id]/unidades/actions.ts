'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { enviarAWp, validarFormulario } from '@/lib/acciones'
import type { EstadoFormulario } from '@/lib/formularios'
import { unidadesNuevasSchema, unidadSchema } from '@/lib/validations/unidad'

const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/

const refrescar = (proyectoId: string | number) => {
  revalidatePath(`/proyectos/${proyectoId}`)
  revalidatePath('/proyectos')
  revalidatePath('/')
}

// Una llamada por unidad (WordPress crea de a una)
export async function crearUnidades(
  proyectoId: string,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const validacion = validarFormulario(unidadesNuevasSchema, formData)
  if (!validacion.ok) return validacion.estado

  const { nombres, fecha_alta, notas } = validacion.datos
  let creadas = 0
  for (const nombre of nombres) {
    const error = await enviarAWp('/unidades', 'POST', { proyecto_id: Number(proyectoId), nombre, fecha_alta, notas }, '')
    if (error) {
      refrescar(proyectoId)
      return {
        error: `Se cargaron ${creadas} de ${nombres.length}. Falló "${nombre}": revisá la conexión e intentá con las que faltan.`,
        errores: {},
      }
    }
    creadas++
  }

  refrescar(proyectoId)
  redirect(`/proyectos/${proyectoId}`)
}

export async function actualizarUnidad(
  proyectoId: string,
  unidadId: string,
  _estado: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const validacion = validarFormulario(unidadSchema, formData)
  if (!validacion.ok) return validacion.estado

  const error = await enviarAWp(`/unidades/${unidadId}`, 'PUT', validacion.datos, 'No se pudo guardar.')
  if (error) return error

  refrescar(proyectoId)
  redirect(`/proyectos/${proyectoId}`)
}

export async function darDeBajaUnidad(proyectoId: number, unidadId: number, fecha: string): Promise<{ error: string | null }> {
  if (!PATRON_FECHA.test(fecha)) return { error: 'Fecha inválida.' }
  const error = await enviarAWp(`/unidades/${unidadId}`, 'PUT', { fecha_baja: fecha }, 'No se pudo dar de baja.')
  if (error) return { error: error.error }
  refrescar(proyectoId)
  return { error: null }
}

export async function eliminarUnidad(proyectoId: number, unidadId: number): Promise<{ error: string | null }> {
  const error = await enviarAWp(`/unidades/${unidadId}`, 'DELETE', undefined, 'No se pudo eliminar.')
  if (error) return { error: error.error }
  refrescar(proyectoId)
  return { error: null }
}
