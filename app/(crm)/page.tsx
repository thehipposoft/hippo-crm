import { HomeDashboard } from '@/components/home/HomeDashboard'
import { getNombreUsuario } from '@/lib/auth'

export default async function Home() {
  return <HomeDashboard userName={await getNombreUsuario()} />
}
