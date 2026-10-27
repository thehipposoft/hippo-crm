const FILAS_ESQUELETO = 6

// Esqueleto genérico mientras WordPress responde (listados, fichas y gráficos)
export default function Loading() {
  return (
    <div className="animate-pulse px-4 py-8 sm:px-8" aria-busy="true" aria-label="Cargando">
      <div className="mb-7 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200/70" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-slate-200" />
      </div>
      <div className="mb-5 h-9 w-full max-w-sm rounded-lg bg-slate-200/70" />
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {Array.from({ length: FILAS_ESQUELETO }, (_, i) => (
          <div key={i} className="flex items-center gap-6 px-5 py-4">
            <div className="h-4 w-1/4 rounded bg-slate-200" />
            <div className="h-4 w-1/6 rounded bg-slate-200/70" />
            <div className="h-4 w-1/6 rounded bg-slate-200/70" />
            <div className="ml-auto h-4 w-12 rounded bg-slate-200/70" />
          </div>
        ))}
      </div>
    </div>
  )
}
