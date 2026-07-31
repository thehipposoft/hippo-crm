import { cookies } from 'next/headers'
import { notFound, unstable_rethrow } from 'next/navigation'
import { wpFetch } from '@/lib/wp'
import type { ClienteRow } from '@/lib/types'
import { EditarClienteForm } from './EditarClienteForm'

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const token = (await cookies()).get('hippo_token')?.value

  let cliente: ClienteRow
  try {
    cliente = await wpFetch(`/clientes/${id}`, token)
  } catch (error) {
    unstable_rethrow(error)
    notFound()
  }

  return <EditarClienteForm cliente={cliente} />
}
