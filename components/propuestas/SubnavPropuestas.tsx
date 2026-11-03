import Link from 'next/link'

const PESTANAS = [
  { href: '/propuestas', label: 'Propuestas y cotizaciones' },
  { href: '/propuestas/plantillas', label: 'Plantillas' },
  { href: '/propuestas/cuentas', label: 'Cuentas bancarias' },
] as const

type Pestana = (typeof PESTANAS)[number]['href']

export const SubnavPropuestas = ({ activa }: { activa: Pestana }) => (
  <nav aria-label="Secciones de propuestas" className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
    {PESTANAS.map(({ href, label }) => (
      <Link
        key={href}
        href={href}
        aria-current={href === activa ? 'page' : undefined}
        className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors ${
          href === activa ? 'border-brand-blue font-medium text-dark-text' : 'border-transparent text-dark-text/50 hover:text-dark-text'
        }`}
      >
        {label}
      </Link>
    ))}
  </nav>
)
