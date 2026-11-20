import Image from 'next/image'
import Link from 'next/link'
import { ServiciosEstado } from '@/components/documentos/ServiciosEstado'
import { HistorialPagos, ResumenEstado, SeccionEstado as Seccion } from '@/components/documentos/VistaEstado'
import { armarEstadoDeCuenta } from '@/lib/documentos/estadoDeCuenta'
import { armarServicios } from '@/lib/documentos/servicios'
import { TEXTOS_SERVICIOS } from '@/lib/documentos/textosServicios'
import { fechaDoc, idiomaPara, montoDoc, TEXTOS } from '@/lib/documentos/idioma'
import { EMPRESA } from '@/lib/empresa'
import { hoy } from '@/lib/fechas'
import { agruparPropuestas, proximosPagos } from '@/lib/portal/portal'
import { obtenerEstadoPortal } from '@/lib/portal/sesion'
import { TEXTOS_PORTAL } from '@/lib/portal/textos'
import { numeroPropuesta, rutaPublicaPropuesta } from '@/lib/propuestas'
import { EnlaceEmail } from '@/components/ui/EnlaceEmail'

export default async function PortalCuentaPage() {
  const datos = await obtenerEstadoPortal()
  const fechaHoy = hoy()
  const idioma = idiomaPara(datos.cliente.pais)
  const t = TEXTOS_PORTAL[idioma]
  const td = TEXTOS[idioma]
  const estado = armarEstadoDeCuenta(datos.proyectos, datos.pagos, fechaHoy)
  const proximos = proximosPagos(estado)
  const { pendientes, resto } = agruparPropuestas(datos.propuestas, fechaHoy)
  const servicios = armarServicios(estado, datos.propuestasProyectos)
  const rutaRecibo = '/portal/cuenta/recibo/:id'

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

        <div className="mt-8">
          <ResumenEstado estado={estado} servicios={servicios} proximos={proximos} idioma={idioma} />
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

        <Seccion titulo={TEXTOS_SERVICIOS[idioma].servicios}>
          <ServiciosEstado servicios={servicios} idioma={idioma} rutaRecibo={rutaRecibo} />
        </Seccion>

        <HistorialPagos servicios={servicios} idioma={idioma} rutaRecibo={rutaRecibo} />

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
          {td.consultas}: <EnlaceEmail /> · {EMPRESA.web}
        </footer>
      </main>
    </div>
  )
}
