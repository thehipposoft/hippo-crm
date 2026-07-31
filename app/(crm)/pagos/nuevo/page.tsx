import { cookies } from 'next/headers'
import { wpFetch } from '@/lib/wp'
import type { ProyectoRow } from '@/lib/types'
import { NuevoPagoForm } from './NuevoPagoForm'

export default async function NuevoPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string }>
}) {
  const { proyecto } = await searchParams
  const token = (await cookies()).get('hippo_token')?.value
  const proyectos = await wpFetch<ProyectoRow[]>('/proyectos', token)

  return <NuevoPagoForm proyectos={proyectos} proyectoIdInicial={proyecto} />
}
