import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { armarEstadoDeCuenta } from '@/lib/documentos/estadoDeCuenta'
import { fechaDoc, idiomaPara, medioDoc, montoDoc, numeroRecibo, TEXTOS, type Idioma } from '@/lib/documentos/idioma'
import { EMPRESA } from '@/lib/empresa'
import { hoy } from '@/lib/fechas'
import { agruparPropuestas, proximosPagos } from '@/lib/portal/portal'
import { obtenerEstadoPortal } from '@/lib/portal/sesion'
import { TEXTOS_PORTAL } from '@/lib/portal/textos'
import { numeroPropuesta, rutaPublicaPropuesta } from '@/lib/propuestas'
import type { Moneda } from '@/lib/types'

const MAX_PAGOS = 24
const TOLERANCIA = 0.005

const Tarjeta = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-medium uppercase tracking-[0.14em] text-dark-text/50">{titulo}</p>
    <div className="mt-2">{children}</div>
  </div>
)

const Seccion = ({ titulo, children, accion }: { titulo: string; children: ReactNode; accion?: ReactNode }) => (
  <section className="mt-10">
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <h2 className="font-display text-lg font-semibold tracking-tight">{titulo}</h2>
      {accion}
    </div>
    {children}
  </section>
)

const SaldoMoneda = ({ moneda, saldo, idioma }: { moneda: Moneda; saldo: number; idioma: Idioma }) => {
  const t = TEXTOS[idioma]
  if (Math.abs(saldo) < TOLERANCIA) return <p className="text-2xl font-semibold text-brand-forest">{t.alDia}</p>
  if (saldo < 0) {
    return (
      <p className="text-2xl font-semibold text-brand-forest">
        {montoDoc(-saldo, moneda, idioma)} <span className="text-sm font-medium">{t.aFavor}</span>
      </p>
    )
  }
  return <p className="text-2xl font-semibold tabular-nums">{montoDoc(saldo, moneda, idioma)}</p>
}

export default async function PortalCuentaPage() {
  const datos = await obtenerEstadoPortal()
  const fechaHoy = hoy()
  const idioma = idiomaPara(datos.cliente.pais)
  const t = TEXTOS_PORTAL[idioma]
  const td = TEXTOS[idioma]
  const estado = armarEstadoDeCuenta(datos.proyectos, datos.pagos, fechaHoy)
  const proximos = proximosPagos(estado)
  const { pendientes, resto } = agruparPropuestas(datos.propuestas, fechaHoy)
  const totales = Object.entries(estado.totales) as [Moneda, { saldo: number }][]
  const proyectoDe = (id: number) => datos.proyectos.find((p) => Number(p.id) === Number(id))?.nombre ?? '—'

  return (
    <div className="pb-16">
      <header className="bg-dark-text text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex items-end gap-2">
            <Image src={EMPRESA.logoBlanco} alt="Hippo" width={84} height={21} priority />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">{t.portal}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-white/70 sm:inline">{datos.acceso.nombre}</span>
            <a href="/portal/salir" className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10">
              {t.salir}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 pt-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-text/50">{datos.cliente.nombre}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.hola(datos.acceso.nombre.split(' ')[0])}
              <span className="ml-1 inline-block h-[0.2em] w-[0.2em] bg-brand-blue" aria-hidden />
            </h1>
            <p className="mt-1 text-sm text-dark-text/50">
              {t.actualizado} {fechaDoc(fechaHoy, idioma)}
            </p>
          </div>
          <Link
            href="/portal/cuenta/estado"
            className="rounded-lg bg-dark-text px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dark-text/85"
          >
            {t.descargarEstado}
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Tarjeta titulo={t.saldoActual}>
            {totales.length === 0 ? (
              <p className="text-2xl font-semibold text-brand-forest">{td.alDia}</p>
            ) : (
              <div className="space-y-1">
                {totales.map(([moneda, total]) => (
                  <SaldoMoneda key={moneda} moneda={moneda} saldo={total.saldo} idioma={idioma} />
                ))}
              </div>
            )}
          </Tarjeta>
          <Tarjeta titulo={t.proximoPago}>
            {proximos[0] ? (
              <>
                <p className="text-2xl font-semibold tabular-nums">{montoDoc(proximos[0].monto, proximos[0].moneda, idioma)}</p>
                <p className="mt-0.5 text-sm text-dark-text/60">
                  {fechaDoc(proximos[0].fecha, idioma)} · {proximos[0].proyecto}
                </p>
              </>
            ) : (
              <p className="text-sm text-dark-text/50">{t.sinProximos}</p>
            )}
          </Tarjeta>
        </div>

        {pendientes.length > 0 && (
          <Seccion titulo={t.paraResponder}>
            <ul className="space-y-3">
              {pendientes.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dark-text bg-white p-5">
                  <div className="min-w-0">
                    <p className="text-xs text-dark-text/50">{numeroPropuesta(p)}</p>
                    <p className="font-semibold">{p.titulo}</p>
                    <p className="text-sm text-dark-text/60">
                      {montoDoc(p.total, p.moneda, idioma)}
                      {p.fechaVencimiento && ` · ${t.venceEl} ${fechaDoc(p.fechaVencimiento, idioma)}`}
                    </p>
                  </div>
                  {p.token && (
                    <Link
                      href={rutaPublicaPropuesta(p.token)}
                      className="rounded-lg bg-dark-text px-4 py-2 text-sm font-semibold text-white transition hover:bg-dark-text/85"
                    >
                      {t.verYResponder}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </Seccion>
        )}

        {proximos.length > 0 && (
          <Seccion titulo={td.proximosVencimientos}>
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {proximos.map((p) => (
                <li key={p.proyectoId} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">{p.proyecto}</p>
                    <p className="text-xs text-dark-text/50">{fechaDoc(p.fecha, idioma)}</p>
                  </div>
                  <span className="whitespace-nowrap font-medium tabular-nums">{montoDoc(p.monto, p.moneda, idioma)}</span>
                </li>
              ))}
            </ul>
          </Seccion>
        )}

        <Seccion titulo={td.proyectos}>
          {estado.proyectos.length === 0 ? (
            <p className="text-sm text-dark-text/50">{td.sinProyectos}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {estado.proyectos.map(({ proyecto, resumen, saldo }) => (
                <div key={proyecto.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="font-semibold">{proyecto.nombre}</p>
                  <dl className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-dark-text/60">{td.totalALaFecha}</dt>
                      <dd className="tabular-nums">{montoDoc(resumen.adeudado, resumen.moneda, idioma)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-dark-text/60">{td.pagado}</dt>
                      <dd className="tabular-nums">{montoDoc(resumen.pagado, resumen.moneda, idioma)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-slate-100 pt-1 font-medium">
                      <dt>{td.saldo}</dt>
                      <dd className={`tabular-nums ${saldo.tipo === 'PENDIENTE' ? '' : 'text-brand-forest'}`}>
                        {saldo.tipo === 'AL_DIA'
                          ? td.alDia
                          : saldo.tipo === 'A_FAVOR'
                            ? `${montoDoc(saldo.monto, resumen.moneda, idioma)} ${td.aFavor}`
                            : montoDoc(saldo.monto, resumen.moneda, idioma)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          )}
        </Seccion>

        <Seccion titulo={t.pagos}>
          {estado.movimientos.length === 0 ? (
            <p className="text-sm text-dark-text/50">{td.sinMovimientos}</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {estado.movimientos.slice(0, MAX_PAGOS).map((pago) => (
                <li key={pago.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium tabular-nums">{montoDoc(pago.monto, pago.moneda, idioma)}</p>
                    <p className="text-xs text-dark-text/50">
                      {[fechaDoc(pago.fecha, idioma), proyectoDe(pago.proyectoId), pago.medioPago && medioDoc(pago.medioPago, idioma)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Link href={`/portal/cuenta/recibo/${pago.id}`} className="text-xs font-medium text-dark-text underline decoration-brand-blue decoration-2 underline-offset-2">
                    {t.recibo} {numeroRecibo(pago.id)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        {resto.length > 0 && (
          <Seccion titulo={t.propuestas}>
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {resto.map((p) => {
                const estadoVisible = p.estado === 'ENVIADA' && p.vencida ? 'VENCIDA' : p.estado
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium">{p.titulo}</p>
                      <p className="text-xs text-dark-text/50">
                        {numeroPropuesta(p)} · {fechaDoc(p.fecha, idioma)} · {montoDoc(p.total, p.moneda, idioma)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          estadoVisible === 'ACEPTADA' ? 'bg-brand-forest/10 text-brand-forest' : 'bg-slate-100 text-dark-text/60'
                        }`}
                      >
                        {t.estadoPropuesta[estadoVisible]}
                      </span>
                      {p.token && (
                        <Link href={rutaPublicaPropuesta(p.token)} className="text-xs font-medium text-dark-text underline decoration-brand-blue decoration-2 underline-offset-2">
                          {t.ver}
                        </Link>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Seccion>
        )}

        <footer className="mt-14 border-t border-slate-200 pt-5 text-xs text-dark-text/50">
          {td.consultas}: {EMPRESA.email} · {EMPRESA.web}
        </footer>
      </main>
    </div>
  )
}
