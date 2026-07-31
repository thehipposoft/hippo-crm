import Link from 'next/link'

type AtajoBoard = {
  label: string
  href: string
  icon: string
}

const ATAJOS: AtajoBoard[] = [
  {
    label: 'Proyectos',
    href: '/proyectos',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    label: 'Pagos',
    href: '/pagos',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m0-12a9 9 0 100 18 9 9 0 000-18z',
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

interface HomeDashboardProps {
  userName: string
}

export const HomeDashboard = ({ userName }: HomeDashboardProps) => {
  return (
    <div className="px-8 py-8 h-full flex flex-col justify-center items-center">
      <h1 className="text-center text-4xl font-semibold text-dark-text sm:text-5xl">
        Bienvenido{' '}
        <span className="bg-linear-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
          {userName}
        </span>{' '}
        a la administración del mejor equipo del mundo! :)
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ATAJOS.map(({ label, href, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-8 text-sm font-medium text-dark-text/70 transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5 hover:text-dark-text min-w-52"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
            </svg>
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
