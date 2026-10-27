import { redirect } from 'next/navigation'
import { getToken } from '@/lib/auth'

// Documentos internos (con sesión), sin el sidebar del CRM
export default async function DocumentosLayout({ children }: { children: React.ReactNode }) {
  if (!(await getToken())) redirect('/login')
  return <div className="min-h-dvh bg-brand-white py-6 print:bg-white print:py-0">{children}</div>
}
