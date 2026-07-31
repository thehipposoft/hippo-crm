import { cookies } from 'next/headers'
import { notFound, unstable_rethrow } from 'next/navigation'
import { wpFetch } from '@/lib/wp'
import type { ClienteRow, ProyectoRow } from '@/lib/types'
import { EditarProyectoForm } from './EditarProyectoForm'

export default async function EditarProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const token = (await cookies()).get('hippo_token')?.value

  let proyecto: ProyectoRow
  try {
    proyecto = await wpFetch(`/proyectos/${id}`, token)
  } catch (error) {
    unstable_rethrow(error)
    notFound()
  }

  const clientes = await wpFetch<ClienteRow[]>('/clientes', token)

  return <EditarProyectoForm proyecto={proyecto} clientes={clientes} />
}
