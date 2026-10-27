import Link from 'next/link'
import { NAVEGACION } from '@/lib/navegacion'

// Todo menos el Dashboard, que es esta misma página
const ATAJOS = NAVEGACION.filter(({ href }) => href !== '/')

interface HomeDashboardProps {
  userName: string
}

export const HomeDashboard = ({ userName }: HomeDashboardProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8 sm:px-8">
      <h1 className="text-center text-3xl font-semibold text-dark-text sm:text-5xl">
        Bienvenido{' '}
        <span className="bg-linear-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
          {userName}
        </span>{' '}
        a la administración del mejor equipo del mundo! :)
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ATAJOS.map(({ label, href, icono }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-8 text-sm font-medium text-dark-text/70 transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5 hover:text-dark-text sm:min-w-52"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icono} />
            </svg>
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
