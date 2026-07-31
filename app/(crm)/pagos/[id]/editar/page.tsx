import { cookies } from 'next/headers'
import { notFound, unstable_rethrow } from 'next/navigation'
import { wpFetch } from '@/lib/wp'
import type { PagoRow, ProyectoRow } from '@/lib/types'
import { EditarPagoForm } from './EditarPagoForm'

export default async function EditarPagoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const token = (await cookies()).get('hippo_token')?.value

  let pago: PagoRow
  try {
    pago = await wpFetch(`/pagos/${id}`, token)
  } catch (error) {
    unstable_rethrow(error)
    notFound()
  }

  const proyectos = await wpFetch<ProyectoRow[]>('/proyectos', token)

  return <EditarPagoForm pago={pago} proyectos={proyectos} />
}
