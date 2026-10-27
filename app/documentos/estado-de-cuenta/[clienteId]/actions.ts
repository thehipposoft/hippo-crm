'use server'

import { revalidatePath } from 'next/cache'
import { enviarAWp } from '@/lib/acciones'

const MENSAJE_WP = '¿Está actualizado el functions.php en WordPress?'

// POST genera un token nuevo (el anterior deja de funcionar); DELETE lo desactiva
export async function cambiarLinkPublico(clienteId: number, accion: 'crear' | 'desactivar'): Promise<{ error: string | null }> {
  const error = await enviarAWp(
    `/clientes/${clienteId}/link-publico`,
    accion === 'crear' ? 'POST' : 'DELETE',
    undefined,
    `No se pudo ${accion === 'crear' ? 'crear' : 'desactivar'} el link. ${MENSAJE_WP}`
  )
  if (error) return { error: error.error }

  revalidatePath(`/documentos/estado-de-cuenta/${clienteId}`)
  return { error: null }
}
