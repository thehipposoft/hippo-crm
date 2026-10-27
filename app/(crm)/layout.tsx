import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { getNombreUsuario, getToken } from '@/lib/auth'

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken()
  if (!token) redirect('/login')

  const userName = await getNombreUsuario()

  return (
    <div className="flex h-dvh flex-col bg-brand-white text-dark-text md:flex-row">
      <Sidebar userName={userName} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
