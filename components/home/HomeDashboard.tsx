import Link from 'next/link'

type AtajoBoard = {
  label: string
  href: string
}

const ATAJOS: AtajoBoard[] = [
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Clientes', href: '/clientes' },
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
        {ATAJOS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-8 text-sm font-medium text-dark-text/70 transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5 hover:text-dark-text min-w-52"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
