import { cookies } from 'next/headers'
import { HomeDashboard } from '@/components/home/HomeDashboard'

export default async function Home() {
  const cookieStore = await cookies()
  const userName = cookieStore.get('hippo_user_name')?.value ?? 'Usuario'

  return <HomeDashboard userName={userName} />
}
