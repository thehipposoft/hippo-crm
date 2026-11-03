import Link from 'next/link'

interface PageHeaderProps {
  titulo: string
  cantidad: number
  singular: string
  plural: string
  nuevoHref: string
  nuevoLabel: string
  // Segundo botón (ej. "Nueva cotización")
  secundario?: { href: string; label: string }
}

// Encabezado de los listados: título, total y botón "Nuevo"
export const PageHeader = ({ titulo, cantidad, singular, plural, nuevoHref, nuevoLabel, secundario }: PageHeaderProps) => (
  <div className="mb-7 flex items-center justify-between gap-4">
    <div>
      <h1 className="text-xl font-semibold text-dark-text">{titulo}</h1>
      <p className="mt-0.5 text-sm text-dark-text/50">
        {cantidad} {cantidad === 1 ? singular : plural} en total
      </p>
    </div>

    <div className="flex flex-wrap items-center justify-end gap-2">
    {secundario && (
      <Link
        href={secundario.href}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-dark-text transition-colors hover:bg-brand-blue/10"
      >
        {secundario.label}
      </Link>
    )}
    <Link
      href={nuevoHref}
      className="flex items-center gap-2 rounded-lg bg-dark-text px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dark-text/85"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      {nuevoLabel}
    </Link>
    </div>
  </div>
)
