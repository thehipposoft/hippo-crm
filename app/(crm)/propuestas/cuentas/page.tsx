import Link from 'next/link'
import { BotonEliminar } from '@/components/costos/BotonEliminar'
import { SubnavPropuestas } from '@/components/propuestas/SubnavPropuestas'
import { PageHeader } from '@/components/ui/PageHeader'
import type { CuentaBancariaRow } from '@/lib/types'
import { wpGetOpcional } from '@/lib/wp'
import { eliminarCuenta } from './actions'

export default async function CuentasPage() {
  const cuentas = await wpGetOpcional<CuentaBancariaRow[]>('/cuentas-bancarias', [])

  return (
    <div className="px-4 py-8 sm:px-8">
      <PageHeader titulo="Propuestas" cantidad={cuentas.length} singular="cuenta" plural="cuentas" nuevoHref="/propuestas/cuentas/nueva" nuevoLabel="Nueva cuenta" />
      <SubnavPropuestas activa="/propuestas/cuentas" />

      {cuentas.length === 0 ? (
        <p className="max-w-xl rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-dark-text/50">
          Cargá tus cuentas (transferencia en AUD, EUR, ARS, PayPal…) una sola vez y elegí cuáles mostrar en cada cotización.
        </p>
      ) : (
        <div className="grid max-w-4xl gap-3 sm:grid-cols-2">
          {cuentas.map((c) => (
            <div key={c.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-dark-text">{c.nombre}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-dark-text/60">{c.moneda ?? 'Cualquier moneda'}</span>
              </div>
              <p className="mt-2 flex-1 whitespace-pre-line font-mono text-xs leading-relaxed text-dark-text/60">{c.detalle}</p>
              <div className="mt-3 flex justify-end gap-1">
                <Link
                  href={`/propuestas/cuentas/${c.id}`}
                  className="rounded-md px-2 py-1 text-xs font-medium text-dark-text/60 transition-colors hover:bg-brand-blue/10 hover:text-dark-text"
                >
                  Editar
                </Link>
                <BotonEliminar
                  compacto
                  accion={eliminarCuenta.bind(null, c.id)}
                  titulo="¿Eliminar esta cuenta?"
                  mensaje="Deja de aparecer en todas las propuestas y cotizaciones, también en las ya enviadas."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
