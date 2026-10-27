'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

// Casi siempre es WordPress caído o lento: se ofrece reintentar
export default function ErrorPage({ error, unstable_retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m0 3.75h.008M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h1 className="text-lg font-semibold text-dark-text">No se pudieron cargar los datos</h1>
      <p className="mt-1 max-w-sm text-sm text-dark-text/60">
        WordPress no respondió o devolvió un error. Puede ser algo momentáneo.
      </p>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white transition hover:brightness-95"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-dark-text transition-colors hover:bg-slate-50"
        >
          Ir al inicio
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-dark-text/30">Código: {error.digest}</p>}
    </div>
  )
}
