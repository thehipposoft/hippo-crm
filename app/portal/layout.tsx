import type { Metadata } from 'next'

// Portal de clientes: fuera de buscadores, sin la sidebar del CRM
export const metadata: Metadata = {
  title: 'Portal de clientes · Hippo',
  robots: { index: false, follow: false },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-brand-white text-dark-text print:bg-white">{children}</div>
}
