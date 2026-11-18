import type { ReactNode } from 'react'
import { fechaDoc, montoDoc, TEXTOS, type Idioma } from '@/lib/documentos/idioma'
import type { EstadoDeCuenta, TotalMoneda } from '@/lib/documentos/estadoDeCuenta'
import type { Servicio } from '@/lib/documentos/servicios'
import { TEXTOS_SERVICIOS } from '@/lib/documentos/textosServicios'
import type { ProximoPago } from '@/lib/portal/portal'
import type { Moneda } from '@/lib/types'
import { ListaPagos } from './ServiciosEstado'

// Piezas de la vista en pantalla del estado de cuenta (link público y portal)

const TOLERANCIA = 0.005

const Tarjeta = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-medium uppercase tracking-[0.14em] text-dark-text/50">{titulo}</p>
    <div className="mt-2">{children}</div>
  </div>
)

export const SeccionEstado = ({ titulo, children, accion }: { titulo: string; children: ReactNode; accion?: ReactNode }) => (
  <section className="mt-10">
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <h2 className="font-display text-lg font-semibold tracking-tight">{titulo}</h2>
      {accion}
    </div>
    {children}
  </section>
)

const SaldoMoneda = ({ moneda, total, idioma }: { moneda: Moneda; total: TotalMoneda; idioma: Idioma }) => {
  const t = TEXTOS_SERVICIOS[idioma]
  const td = TEXTOS[idioma]
  if (total.saldo < TOLERANCIA) {
    return (
      <p className="text-2xl font-semibold text-brand-forest">
        {total.saldo < -TOLERANCIA ? (
          <>
            {montoDoc(-total.saldo, moneda, idioma)} <span className="text-sm font-medium">{td.aFavor}</span>
          </>
        ) : (
          td.alDia
        )}
      </p>
    )
  }
  return (
    <div>
      <p className="text-2xl font-semibold tabular-nums">{montoDoc(total.saldo, moneda, idioma)}</p>
      <p className="text-xs text-dark-text/50 tabular-nums">{t.pagadoDe(montoDoc(total.pagado, moneda, idioma), montoDoc(total.adeudado, moneda, idioma))}</p>
    </div>
  )
}

// Saldo de cada moneda con deuda (nunca se suman monedas) y próximo pago
export const ResumenEstado = ({ estado, proximos, idioma }: { estado: EstadoDeCuenta; proximos: ProximoPago[]; idioma: Idioma }) => {
  const t = TEXTOS_SERVICIOS[idioma]
  const totales = Object.entries(estado.totales) as [Moneda, TotalMoneda][]
  const conDeuda = totales.filter(([, total]) => total.saldo >= TOLERANCIA)
  const proximo = proximos[0]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {conDeuda.length === 0 ? (
        <Tarjeta titulo={t.saldoPendiente}>
          <p className="text-2xl font-semibold text-brand-forest">{t.estasAlDia}</p>
          <p className="text-xs text-dark-text/50">{t.sinDeudas}</p>
        </Tarjeta>
      ) : (
        <Tarjeta titulo={t.saldoPendiente}>
          <div className="space-y-2">
            {conDeuda.map(([moneda, total]) => (
              <SaldoMoneda key={moneda} moneda={moneda} total={total} idioma={idioma} />
            ))}
          </div>
        </Tarjeta>
      )}
      <Tarjeta titulo={t.proximoPago}>
        {proximo ? (
          <>
            <p className="text-2xl font-semibold tabular-nums">{montoDoc(proximo.monto, proximo.moneda, idioma)}</p>
            <p className="mt-0.5 text-sm text-dark-text/60">
              {fechaDoc(proximo.fecha, idioma)} · {proximo.proyecto}
            </p>
          </>
        ) : (
          <p className="text-sm text-dark-text/50">{t.sinProximos}</p>
        )}
      </Tarjeta>
    </div>
  )
}

// Todos los pagos juntos, colapsado: el detalle principal está en cada servicio
export const HistorialPagos = ({ servicios, idioma, rutaRecibo }: { servicios: Servicio[]; idioma: Idioma; rutaRecibo: string }) => {
  const t = TEXTOS_SERVICIOS[idioma]
  const pagos = servicios
    .flatMap((s) => s.pagos.map((p) => ({ ...p, servicio: s.nombre })))
    .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? '') || b.id - a.id)
  if (pagos.length === 0) return null

  return (
    <details className="group mt-10 rounded-2xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
        <span className="font-display text-lg font-semibold tracking-tight">
          {t.historial} <span className="text-sm font-normal text-dark-text/40">{pagos.length}</span>
        </span>
        <svg className="h-4 w-4 text-dark-text/40 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="border-t border-slate-100 px-4 pb-2 sm:px-5">
        <ListaPagos pagos={pagos} idioma={idioma} rutaRecibo={rutaRecibo} conServicio />
      </div>
    </details>
  )
}
