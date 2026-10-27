import { cookies } from 'next/headers'
import { notFound, unstable_rethrow } from 'next/navigation'
import { wpFetch } from '@/lib/wp'
import type { ClienteRow, PagoRow, ProyectoRow } from '@/lib/types'
import { monedaProyecto } from '@/lib/proyectos'
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

  const [clientes, pagos] = await Promise.all([
    wpFetch<ClienteRow[]>('/clientes', token),
    wpFetch<PagoRow[]>(`/proyectos/${id}/pagos`, token),
  ])

  // Proyectos viejos sin moneda: se propone la de sus pagos, no USD a ciegas
  return <EditarProyectoForm proyecto={proyecto} clientes={clientes} monedaInicial={monedaProyecto(proyecto, pagos)} />
}
