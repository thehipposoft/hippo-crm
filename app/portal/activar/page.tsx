import { PantallaClave } from '@/components/portal/PantallaClave'

export default async function PortalActivarPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return <PantallaClave tipo="invitacion" token={token} />
}
