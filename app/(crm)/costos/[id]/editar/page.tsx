import { cookies } from 'next/headers'
import { notFound, unstable_rethrow } from 'next/navigation'
import { wpFetch } from '@/lib/wp'
import type { CostoRow } from '@/lib/types'
import { EditarCostoForm } from './EditarCostoForm'

export default async function EditarCostoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const token = (await cookies()).get('hippo_token')?.value

  let costo: CostoRow
  try {
    costo = await wpFetch(`/costos/${id}`, token)
  } catch (error) {
    unstable_rethrow(error)
    notFound()
  }

  return <EditarCostoForm costo={costo} />
}
