import { PantallaClave } from '@/components/portal/PantallaClave'

export default async function PortalRestablecerPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return <PantallaClave tipo="reset" token={token} />
}
