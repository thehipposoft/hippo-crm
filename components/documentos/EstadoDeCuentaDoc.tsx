import Link from 'next/link'
import type { FechaCalendario } from '@/lib/fechas'
import { fechaDoc, medioDoc, mesDoc, montoDoc, numeroRecibo, TEXTOS, unidadDoc, type Idioma } from '@/lib/documentos/idioma'
import type { EstadoDeCuenta } from '@/lib/documentos/estadoDeCuenta'
import type { Saldo } from '@/lib/proyectos'
import type { ClientePublico, Moneda } from '@/lib/types'
import { Etiqueta, HojaDocumento } from './HojaDocumento'

interface EstadoDeCuentaDocProps {
  cliente: ClientePublico
  estado: EstadoDeCuenta
  idioma: Idioma
  fechaEmision: FechaCalendario
  // Link al recibo de cada pago (en pantalla; en el PDF no se muestra)
  hrefRecibo: (pagoId: number) => string
}

const SaldoTexto = ({ saldo, moneda, idioma }: { saldo: Saldo; moneda: Moneda; idioma: Idioma }) => {
  const t = TEXTOS[idioma]
  if (saldo.tipo === 'AL_DIA') return <span className="text-emerald-700">{t.alDia}</span>
  if (saldo.tipo === 'A_FAVOR') return <span className="text-emerald-700">{montoDoc(saldo.monto, moneda, idioma)} {t.aFavor}</span>
  return <span className="font-medium">{montoDoc(saldo.monto, moneda, idioma)}</span>
}

const saldoDeTotal = (saldo: number): Saldo =>
  saldo > 0.005 ? { tipo: 'PENDIENTE', monto: saldo } : saldo < -0.005 ? { tipo: 'A_FAVOR', monto: -saldo } : { tipo: 'AL_DIA' }

const CLASES_TH = 'py-2 pr-4 text-left text-xs font-medium uppercase tracking-wider text-dark-text/50'
const CLASES_TH_DER = 'py-2 text-right text-xs font-medium uppercase tracking-wider text-dark-text/50'

export const EstadoDeCuentaDoc = ({ cliente, estado, idioma, fechaEmision, hrefRecibo }: EstadoDeCuentaDocProps) => {
  const t = TEXTOS[idioma]
  const totales = Object.entries(estado.totales) as [Moneda, { adeudado: number; pagado: number; saldo: number }][]

  return (
    <HojaDocumento
      idioma={idioma}
      titulo={t.estadoDeCuenta}
      datos={
        <p>
          {t.emitido} <span className="font-medium text-dark-text">{fechaDoc(fechaEmision, idioma)}</span>
        </p>
      }
    >
      <section className="mb-8">
        <Etiqueta>{t.cliente}</Etiqueta>
        <p className="text-base font-semibold">{cliente.nombre}</p>
        <div className="text-xs leading-relaxed text-dark-text/60">
          {cliente.contacto && <p>{cliente.contacto}</p>}
          {cliente.emailContacto && <p>{cliente.emailContacto}</p>}
          {cliente.pais && <p>{cliente.pais}</p>}
        </div>
      </section>

      {totales.length > 0 && (
        <section className="mb-8 break-inside-avoid">
          <Etiqueta>{t.resumen}</Etiqueta>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 print:grid-cols-2">
            {totales.map(([moneda, total]) => (
              <div key={moneda} className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium text-dark-text/50">{moneda}</p>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-dark-text/60">{t.totalALaFecha}</dt>
                    <dd className="tabular-nums">{montoDoc(total.adeudado, moneda, idioma)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-dark-text/60">{t.pagado}</dt>
                    <dd className="tabular-nums">{montoDoc(total.pagado, moneda, idioma)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-slate-100 pt-1 text-base">
                    <dt className="font-medium">{t.saldo}</dt>
                    <dd className="tabular-nums">
                      <SaldoTexto saldo={saldoDeTotal(total.saldo)} moneda={moneda} idioma={idioma} />
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <Etiqueta>{t.proyectos}</Etiqueta>
        {estado.proyectos.length === 0 ? (
          <p className="text-dark-text/50">{t.sinProyectos}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-xl">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className={CLASES_TH}>{t.proyecto}</th>
                  <th className={CLASES_TH}>{t.tipo}</th>
                  <th className={CLASES_TH_DER}>{t.totalALaFecha}</th>
                  <th className={CLASES_TH_DER}>{t.pagado}</th>
                  <th className={CLASES_TH_DER}>{t.saldo}</th>
                </tr>
              </thead>
              <tbody>
                {estado.proyectos.map(({ proyecto, resumen, saldo }) => (
                  <tr key={proyecto.id} className="break-inside-avoid border-b border-slate-100">
                    <td className="py-2.5 pr-4">{proyecto.nombre}</td>
                    <td className="py-2.5 pr-4 text-dark-text/70">
                      {proyecto.tipoProyecto !== 'RECURRENTE'
                        ? t.pagoUnico
                        : proyecto.unidad
                          ? `${t.frecuencia.MENSUAL} · ${montoDoc(proyecto.valor, resumen.moneda, idioma)} / ${unidadDoc(proyecto.unidad, idioma)}`
                          : `${t.frecuencia[proyecto.frecuenciaPago ?? 'MENSUAL']} · ${montoDoc(proyecto.valor, resumen.moneda, idioma)} ${t.porPeriodo[proyecto.frecuenciaPago ?? 'MENSUAL']}`}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pl-4 text-right tabular-nums">{montoDoc(resumen.adeudado, resumen.moneda, idioma)}</td>
                    <td className="whitespace-nowrap py-2.5 pl-4 text-right tabular-nums">{montoDoc(resumen.pagado, resumen.moneda, idioma)}</td>
                    <td className="whitespace-nowrap py-2.5 pl-4 text-right tabular-nums">
                      <SaldoTexto saldo={saldo} moneda={resumen.moneda} idioma={idioma} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {estado.hayOtrasMonedas && <p className="mt-2 text-xs text-dark-text/50">* {t.otrasMonedas}</p>}
      </section>

      {estado.unidades.map(({ proyecto, moneda, meses, activasEsteMes }) => {
        const plural = unidadDoc(proyecto.unidad ?? '', idioma, true)
        return (
          <section key={proyecto.id} className="mb-8 break-inside-avoid">
            <Etiqueta>
              {t.detalleDe} {plural} · {proyecto.nombre}
            </Etiqueta>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className={CLASES_TH}>{t.mes}</th>
                  <th className={CLASES_TH_DER}>{t.activas}</th>
                  <th className={CLASES_TH_DER}>{t.importe}</th>
                </tr>
              </thead>
              <tbody>
                {meses.map((m) => (
                  <tr key={`${m.mes.anio}-${m.mes.mes}`} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{mesDoc(m.mes, idioma)}</td>
                    <td className="py-2 text-right tabular-nums">{m.activas}</td>
                    <td className="whitespace-nowrap py-2 pl-4 text-right tabular-nums">{montoDoc(m.monto, moneda, idioma)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activasEsteMes.length > 0 && (
              <p className="mt-3 text-xs leading-relaxed text-dark-text/60">
                <span className="font-medium text-dark-text/80">
                  {t.activasEsteMes} ({activasEsteMes.length}):
                </span>{' '}
                {activasEsteMes.map((u) => u.nombre).join(', ')}
              </p>
            )}
          </section>
        )
      })}

      {estado.proximos.length > 0 && (
        <section className="mb-8 break-inside-avoid">
          <Etiqueta>{t.proximosVencimientos}</Etiqueta>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {estado.proximos.map(({ proyecto, resumen, proximoVencimiento, unidadesEsteMes }) => (
              <li key={proyecto.id} className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span>
                  {proyecto.nombre}{' '}
                  <span className="text-dark-text/50">
                    · {t.vence} {fechaDoc(proximoVencimiento, idioma)}
                  </span>
                </span>
                <span className="tabular-nums">
                  {t.cuota}: {montoDoc((unidadesEsteMes ?? 1) * proyecto.valor, resumen.moneda, idioma)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <Etiqueta>{t.movimientos}</Etiqueta>
        {estado.movimientos.length === 0 ? (
          <p className="text-dark-text/50">{t.sinMovimientos}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-xl">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className={CLASES_TH}>{t.fecha}</th>
                  <th className={CLASES_TH}>{t.proyecto}</th>
                  <th className={CLASES_TH}>{t.medioDePago}</th>
                  <th className={CLASES_TH}>{t.recibo}</th>
                  <th className={CLASES_TH_DER}>{t.importe}</th>
                </tr>
              </thead>
              <tbody>
                {estado.movimientos.map((pago) => (
                  <tr key={pago.id} className="break-inside-avoid border-b border-slate-100">
                    <td className="whitespace-nowrap py-2.5 pr-4 tabular-nums">{fechaDoc(pago.fecha, idioma)}</td>
                    <td className="py-2.5 pr-4">{pago.proyectoNombre}</td>
                    <td className="py-2.5 pr-4 text-dark-text/70">{medioDoc(pago.medioPago, idioma)}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4">
                      <Link href={hrefRecibo(pago.id)} className="text-brand-blue hover:underline print:text-dark-text print:no-underline">
                        {numeroRecibo(pago.id)}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-right tabular-nums">{montoDoc(pago.monto, pago.moneda, idioma)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </HojaDocumento>
  )
}
