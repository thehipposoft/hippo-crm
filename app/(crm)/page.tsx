import { cookies } from 'next/headers'
import { HomeDashboard } from '@/components/home/HomeDashboard'
import { normalizarNombreUsuario } from '@/lib/user'

export default async function Home() {
  const cookieStore = await cookies()
  const userName = normalizarNombreUsuario(cookieStore.get('hippo_user_name')?.value ?? 'Usuario')

  return <HomeDashboard userName={userName} />
}
