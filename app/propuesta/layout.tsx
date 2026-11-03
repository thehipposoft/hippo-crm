import type { Metadata } from 'next'

// Propuestas que ve el cliente con su link: sin login ni sidebar, y fuera de buscadores
export const metadata: Metadata = {
  title: 'Propuesta · Hippo',
  robots: { index: false, follow: false },
}

export default function PropuestaLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-brand-white py-6 print:bg-white print:py-0">{children}</div>
}
