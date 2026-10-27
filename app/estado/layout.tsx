import type { Metadata } from 'next'

// Páginas que ve el cliente con su link: sin login ni sidebar, y fuera de buscadores
export const metadata: Metadata = {
  title: 'Estado de cuenta',
  robots: { index: false, follow: false },
}

export default function EstadoLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-brand-white py-6 print:bg-white print:py-0">{children}</div>
}
