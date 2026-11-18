'use client'

import Link from 'next/link'
import { useState } from 'react'
import { fechaDoc, medioDoc, mesDoc, montoDoc, numeroRecibo, TEXTOS, unidadDoc, type Idioma } from '@/lib/documentos/idioma'
import { filtrarServicios, type FiltroServicios, type PagoServicio, type Servicio } from '@/lib/documentos/servicios'
import { TEXTOS_SERVICIOS } from '@/lib/documentos/textosServicios'
import type { Moneda } from '@/lib/types'

interface ServiciosEstadoProps {
  servicios: Servicio[]
  idioma: Idioma
  // Ruta del recibo con ":id" en lugar del ID del pago (las funciones no pasan del server al cliente)
  rutaRecibo: string
}

const FILTROS: FiltroServicios[] = ['TODOS', 'CON_SALDO', 'AL_DIA']
const PORCENTAJE = 100

export const hrefRecibo = (rutaRecibo: string, pagoId: number) => rutaRecibo.replace(':id', String(pagoId))

const Chevron = () => (
  <svg className="h-4 w-4 shrink-0 text-dark-text/40 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const EstadoServicio = ({ servicio, idioma }: { servicio: Servicio; idioma: Idioma }) => {
  const t = TEXTOS_SERVICIOS[idioma]
  const { saldo, moneda } = servicio
  if (saldo.tipo === 'PENDIENTE') {
    return (
      <span className="whitespace-nowrap rounded-full bg-brand-orange/10 px-2.5 py-1 text-xs font-semibold text-brand-orange tabular-nums">
        {t.debe} {montoDoc(saldo.monto, moneda, idioma)}
      </span>
    )
  }
  return (
    <span className="whitespace-nowrap rounded-full bg-brand-forest/10 px-2.5 py-1 text-xs font-semibold text-brand-forest tabular-nums">
      {saldo.tipo === 'AL_DIA' ? t.alDia : `${montoDoc(saldo.monto, moneda, idioma)} ${TEXTOS[idioma].aFavor}`}
    </span>
  )
}

// "Pago único" / "Mensual · USD 80,00 / mes" / "USD 5,00 por casilla por mes"
const descripcionServicio = (s: Servicio, idioma: Idioma): string => {
  const td = TEXTOS[idioma]
  const monto = montoDoc(s.valor, s.moneda, idioma)
  if (s.tipo === 'UNICO') return td.pagoUnico
  if (s.tipo === 'POR_UNIDAD' && s.unidad) return TEXTOS_SERVICIOS[idioma].porUnidad(monto, unidadDoc(s.unidad, idioma))
  const frecuencia = s.frecuencia ?? 'MENSUAL'
  return `${td.frecuencia[frecuencia]} · ${monto} ${td.porPeriodo[frecuencia]}`
}

const BarraProgreso = ({ progreso, conDeuda, etiqueta }: { progreso: number; conDeuda: boolean; etiqueta: string }) => (
  <progress
    value={Math.round(progreso * PORCENTAJE)}
    max={PORCENTAJE}
    aria-label={etiqueta}
    className={`block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-slate-100 [&::-webkit-progress-bar]:bg-slate-100 ${
      conDeuda
        ? '[&::-moz-progress-bar]:bg-brand-blue [&::-webkit-progress-value]:bg-brand-blue'
        : '[&::-moz-progress-bar]:bg-brand-forest [&::-webkit-progress-value]:bg-brand-forest'
    } [&::-webkit-progress-value]:rounded-full`}
  />
)

export const ListaPagos = ({ pagos, idioma, rutaRecibo, conServicio }: { pagos: (PagoServicio & { servicio?: string })[]; idioma: Idioma; rutaRecibo: string; conServicio?: boolean }) => (
  <ul className="divide-y divide-slate-100">
    {pagos.map((pago) => (
      <li key={pago.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
        <div className="min-w-0">
          <p className="font-medium tabular-nums">{montoDoc(pago.monto, pago.moneda, idioma)}</p>
          <p className="text-xs text-dark-text/50">
            {[fechaDoc(pago.fecha, idioma), conServicio ? pago.servicio : null, pago.medioPago ? medioDoc(pago.medioPago, idioma) : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <Link
          href={hrefRecibo(rutaRecibo, pago.id)}
          aria-label={`${TEXTOS[idioma].recibo} ${numeroRecibo(pago.id)}`}
          className="shrink-0 whitespace-nowrap text-xs font-medium text-dark-text underline decoration-brand-blue decoration-2 underline-offset-2"
        >
          <span className="hidden sm:inline">{TEXTOS[idioma].recibo} </span>
          {numeroRecibo(pago.id)}
        </Link>
      </li>
    ))}
  </ul>
)

// En mobile: filas etiqueta / monto; desde sm: tres cajas
const Dato = ({ etiqueta, children, destacado }: { etiqueta: string; children: React.ReactNode; destacado?: boolean }) => (
  <div
    className={`flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 sm:block sm:py-2.5 ${destacado ? 'bg-dark-text text-white' : 'bg-brand-white'}`}
  >
    <dt className={`text-[11px] font-medium uppercase tracking-wider ${destacado ? 'text-white/60' : 'text-dark-text/50'}`}>{etiqueta}</dt>
    <dd className="whitespace-nowrap font-semibold tabular-nums sm:mt-0.5">{children}</dd>
  </div>
)

const TarjetaServicio = ({ servicio: s, idioma, rutaRecibo }: { servicio: Servicio; idioma: Idioma; rutaRecibo: string }) => {
  const t = TEXTOS_SERVICIOS[idioma]
  const td = TEXTOS[idioma]
  const conDeuda = s.saldo.tipo === 'PENDIENTE'
  const otras = Object.entries(s.otrasMonedas) as [Moneda, number][]
  const pagadoDe = t.pagadoDe(montoDoc(s.pagado, s.moneda, idioma), montoDoc(s.adeudado, s.moneda, idioma))

  return (
    <details open={conDeuda} className="group rounded-2xl border border-slate-200 bg-white transition-shadow open:shadow-sm">
      <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              {s.nombre}
              {s.finalizado && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-dark-text/60">{t.finalizado}</span>}
            </p>
            <p className="mt-0.5 text-xs text-dark-text/50">{descripcionServicio(s, idioma)}</p>
          </div>
          <div className="flex items-center gap-2">
            <EstadoServicio servicio={s} idioma={idioma} />
            <Chevron />
          </div>
        </div>
        {s.adeudado > 0 && (
          <div className="space-y-1">
            <BarraProgreso progreso={s.progreso} conDeuda={conDeuda} etiqueta={pagadoDe} />
            <p className="text-xs text-dark-text/50 tabular-nums">{pagadoDe}</p>
          </div>
        )}
      </summary>

      <div className="space-y-4 border-t border-slate-100 p-4 sm:p-5">
        <dl className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-3 sm:gap-2">
          <Dato etiqueta={td.totalALaFecha}>{montoDoc(s.adeudado, s.moneda, idioma)}</Dato>
          <Dato etiqueta={td.pagado}>{montoDoc(s.pagado, s.moneda, idioma)}</Dato>
          <Dato etiqueta={td.saldo} destacado={conDeuda}>
            {s.saldo.tipo === 'AL_DIA' ? td.alDia : montoDoc(s.saldo.monto, s.moneda, idioma)}
          </Dato>
        </dl>

        {(s.cuotasPendientes || s.proximo) && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {s.cuotasPendientes ? <p className="font-medium text-brand-orange">{t.cuotasPendientes(s.cuotasPendientes)}</p> : null}
            {s.proximo && (
              <p className="text-dark-text/70">
                {t.proximaCuota}: <span className="font-medium text-dark-text tabular-nums">{montoDoc(s.proximo.monto, s.moneda, idioma)}</span>{' '}
                {t.el} {fechaDoc(s.proximo.fecha, idioma)}
              </p>
            )}
          </div>
        )}

        {otras.length > 0 && (
          <p className="text-xs text-dark-text/60">
            {t.otraMoneda} {otras.map(([moneda, monto]) => montoDoc(monto, moneda, idioma)).join(' · ')}
          </p>
        )}

        {s.meses && s.meses.length > 0 && (
          <details className="group/meses rounded-xl border border-slate-100">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
              {t.detallePorMes}
              <svg className="h-4 w-4 text-dark-text/40 transition-transform group-open/meses:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-slate-100 text-xs uppercase tracking-wider text-dark-text/50">
                  <th className="px-3 py-1.5 text-left font-medium">{td.mes}</th>
                  <th className="px-3 py-1.5 text-right font-medium">{td.activas}</th>
                  <th className="px-3 py-1.5 text-right font-medium">{td.importe}</th>
                </tr>
              </thead>
              <tbody>
                {s.meses.map((m) => (
                  <tr key={`${m.mes.anio}-${m.mes.mes}`} className="border-b border-slate-50 last:border-0">
                    <td className="px-3 py-1.5">{mesDoc(m.mes, idioma)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{m.activas}</td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums">{montoDoc(m.monto, s.moneda, idioma)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {s.activas && s.activas.length > 0 && (
              <p className="border-t border-slate-100 px-3 py-2.5 text-xs leading-relaxed text-dark-text/60">
                <span className="font-medium text-dark-text/80">
                  {t.activasAhora} ({s.activas.length}):
                </span>{' '}
                {s.activas.join(', ')}
              </p>
            )}
          </details>
        )}

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-dark-text/50">{t.pagosDelServicio}</p>
          {s.pagos.length === 0 ? (
            <p className="mt-2 text-sm text-dark-text/50">{t.sinPagos}</p>
          ) : (
            <ListaPagos pagos={s.pagos} idioma={idioma} rutaRecibo={rutaRecibo} />
          )}
        </div>
      </div>
    </details>
  )
}

// Un colapsable por servicio: los que tienen deuda arrancan abiertos
export const ServiciosEstado = ({ servicios, idioma, rutaRecibo }: ServiciosEstadoProps) => {
  const t = TEXTOS_SERVICIOS[idioma]
  const [filtro, setFiltro] = useState<FiltroServicios>('TODOS')
  const visibles = filtrarServicios(servicios, filtro)
  const cantidad = (f: FiltroServicios) => filtrarServicios(servicios, f).length
  const etiqueta: Record<FiltroServicios, string> = { TODOS: t.todos, CON_SALDO: t.conSaldo, AL_DIA: t.alDia }
  // Filtrar solo tiene sentido si hay de los dos grupos
  const conFiltros = cantidad('CON_SALDO') > 0 && cantidad('AL_DIA') > 0

  if (servicios.length === 0) return <p className="text-sm text-dark-text/50">{TEXTOS[idioma].sinProyectos}</p>

  return (
    <div>
      {conFiltros && (
        <div role="group" aria-label={t.servicios} className="mb-3 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filtro === f}
              onClick={() => setFiltro(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filtro === f ? 'border-dark-text bg-dark-text text-white' : 'border-slate-200 bg-white text-dark-text/70 hover:border-dark-text/40'
              }`}
            >
              {etiqueta[f]} <span className={filtro === f ? 'text-white/60' : 'text-dark-text/40'}>{cantidad(f)}</span>
            </button>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {visibles.map((s) => (
          <TarjetaServicio key={s.id} servicio={s} idioma={idioma} rutaRecibo={rutaRecibo} />
        ))}
        {visibles.length === 0 && <p className="text-sm text-dark-text/50">{t.sinServiciosFiltro}</p>}
      </div>
    </div>
  )
}
