import { cookies } from 'next/headers'
import { wpFetch } from '@/lib/wp'
import type { ClienteRow } from '@/lib/types'
import { NuevoProyectoForm } from './NuevoProyectoForm'

export default async function NuevoProyectoPage() {
  const token = (await cookies()).get('hippo_token')?.value
  const clientes = await wpFetch<ClienteRow[]>('/clientes', token)

  return <NuevoProyectoForm clientes={clientes} />
}
