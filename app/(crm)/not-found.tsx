import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium text-brand-blue">404</p>
      <h1 className="mt-1 text-lg font-semibold text-dark-text">No encontramos lo que buscabas</h1>
      <p className="mt-1 max-w-sm text-sm text-dark-text/60">Puede que se haya eliminado o que el link esté mal.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white transition hover:brightness-95"
      >
        Ir al inicio
      </Link>
    </div>
  )
}
