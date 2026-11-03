import Image from 'next/image'
import type { ReactNode } from 'react'
import { EMPRESA } from '@/lib/empresa'
import { fechaDoc, mesDoc, montoDoc, type Idioma } from '@/lib/documentos/idioma'
import { TEXTOS_PROPUESTA } from '@/lib/documentos/textosPropuesta'
import { parseFecha } from '@/lib/fechas'
import { numeroPropuesta, subtotalItem, totalesPropuesta } from '@/lib/propuestas'
import type { PropuestaPublica } from '@/lib/types'
import { Markdown } from './Markdown'

const DIGITOS_SECCION = 2

interface PropuestaDocumentoProps {
  propuesta: PropuestaPublica
  // Bloque de aceptar / rechazar (solo en el link público)
  respuesta?: ReactNode
}

// Punto cuadrado de la marca al final de los títulos
const Punto = ({ className = '' }: { className?: string }) => (
  <span className={`ml-[0.12em] inline-block h-[0.2em] w-[0.2em] bg-brand-blue align-baseline ${className}`} aria-hidden />
)

const Dato = ({ label, children, claro = false }: { label: string; children: ReactNode; claro?: boolean }) => (
  <div>
    <p className={`text-[0.6875rem] font-medium uppercase tracking-[0.16em] ${claro ? 'text-white/50' : 'text-dark-text/50'}`}>{label}</p>
    <p className={`mt-1 text-sm font-medium ${claro ? 'text-white' : 'text-dark-text'}`}>{children}</p>
  </div>
)

// Documento de propuesta o cotización: el mismo para el link público y la vista previa del CRM.
// Se imprime en A4 con "Descargar PDF" (impresión del navegador).
export const PropuestaDocumento = ({ propuesta, respuesta }: PropuestaDocumentoProps) => {
  const idioma: Idioma = propuesta.idioma
  const t = TEXTOS_PROPUESTA[idioma]
  const esPropuesta = propuesta.tipo === 'PROPUESTA'
  const fecha = parseFecha(propuesta.fecha)
  const etiquetaVence = esPropuesta ? t.validaHasta : t.vencimiento

  return (
    <article className="mx-auto w-full max-w-[210mm] bg-white text-dark-text shadow-sm print:max-w-none print:shadow-none">
      {esPropuesta ? (
        <Portada propuesta={propuesta} idioma={idioma} etiquetaVence={etiquetaVence} mes={fecha ? mesDoc(fecha, idioma) : ''} />
      ) : (
        <EncabezadoCotizacion propuesta={propuesta} idioma={idioma} etiquetaVence={etiquetaVence} />
      )}

      <div className="space-y-12 px-6 py-10 sm:px-12 print:space-y-7 print:px-0 print:py-6">
        {propuesta.secciones.map((seccion, i) => (
          <SeccionDoc key={i} numero={esPropuesta ? i + 1 : null} titulo={seccion.titulo}>
            <Markdown texto={seccion.contenido} />
          </SeccionDoc>
        ))}

        <SeccionDoc numero={esPropuesta ? propuesta.secciones.length + 1 : null} titulo={esPropuesta ? t.inversion : t.detalle} salto={esPropuesta}>
          <TablaItems propuesta={propuesta} idioma={idioma} />
          {/* En la cotización el vencimiento ya está en el encabezado */}
          {esPropuesta && propuesta.fechaVencimiento && (
            <p className="mt-4 text-sm text-dark-text/60">
              {etiquetaVence}: <span className="font-medium text-dark-text">{fechaDoc(propuesta.fechaVencimiento, idioma)}</span>
            </p>
          )}
        </SeccionDoc>

        {propuesta.cuentas.length > 0 && (
          <section className="break-inside-avoid">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-dark-text/50">{t.datosDePago}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {propuesta.cuentas.map((cuenta, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold">{cuenta.nombre}</p>
                  <p className="mt-1.5 whitespace-pre-line font-mono text-xs leading-relaxed text-dark-text/70">{cuenta.detalle}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {propuesta.notas && (
          <section className="break-inside-avoid">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-dark-text/50">{t.condiciones}</h3>
            <Markdown texto={propuesta.notas} />
          </section>
        )}

        {respuesta}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-5 text-xs text-dark-text/50 sm:px-12 print:px-0">
        <Image src={EMPRESA.logo} alt={EMPRESA.nombre} width={64} height={16} />
        <p>
          {t.consultas}: {EMPRESA.email} · {EMPRESA.web}
        </p>
      </footer>
    </article>
  )
}

const Portada = ({
  propuesta,
  idioma,
  etiquetaVence,
  mes,
}: {
  propuesta: PropuestaPublica
  idioma: Idioma
  etiquetaVence: string
  mes: string
}) => {
  const t = TEXTOS_PROPUESTA[idioma]
  return (
    <header className="flex min-h-[640px] flex-col justify-between gap-12 px-6 pb-8 pt-8 sm:px-12 sm:pt-10 print:h-[268mm] print:min-h-0 print:break-after-page print:px-0 print:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Image src={EMPRESA.logo} alt={EMPRESA.nombre} width={EMPRESA.logoAncho} height={EMPRESA.logoAlto} priority />
        <span className="rounded-full border border-dark-text/20 px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-dark-text/70">
          {t.PROPUESTA} · {mes}
        </span>
      </div>

      <div>
        {propuesta.cliente.nombre && (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-text/50">
            {t.preparadaPara} <span className="text-dark-text">{propuesta.cliente.nombre}</span>
          </p>
        )}
        <h1 className="mt-4 max-w-[16ch] font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          {propuesta.titulo}
          <Punto />
        </h1>
        {propuesta.resumen && <p className="mt-6 max-w-xl text-lg leading-relaxed text-dark-text/70">{propuesta.resumen}</p>}
        <p className="mt-8 font-editorial text-2xl italic text-brand-plum">{t.lema}</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-dark-text p-6 sm:p-8">
        <span className="absolute right-6 top-6 h-4 w-4 bg-brand-blue" aria-hidden />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <Dato label={t.numero} claro>
            {numeroPropuesta(propuesta)}
          </Dato>
          <Dato label={t.fecha} claro>
            {fechaDoc(propuesta.fecha, idioma)}
          </Dato>
          {propuesta.fechaVencimiento && (
            <Dato label={etiquetaVence} claro>
              {fechaDoc(propuesta.fechaVencimiento, idioma)}
            </Dato>
          )}
        </div>
      </div>
    </header>
  )
}

const EncabezadoCotizacion = ({
  propuesta,
  idioma,
  etiquetaVence,
}: {
  propuesta: PropuestaPublica
  idioma: Idioma
  etiquetaVence: string
}) => {
  const t = TEXTOS_PROPUESTA[idioma]
  return (
    <header className="border-t-[6px] border-dark-text px-6 pt-8 sm:px-12 sm:pt-10 print:px-0 print:pt-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Image src={EMPRESA.logo} alt={EMPRESA.nombre} width={EMPRESA.logoAncho} height={EMPRESA.logoAlto} priority />
          <div className="text-xs leading-relaxed text-dark-text/60">
            <p className="font-medium text-dark-text">{EMPRESA.nombre}</p>
            <p>{EMPRESA.web}</p>
            <p>{EMPRESA.email}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {t.COTIZACION}
            <Punto />
          </h1>
          <p className="mt-1 text-sm text-dark-text/60">
            {t.numero} <span className="font-medium text-dark-text">{numeroPropuesta(propuesta)}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 rounded-xl bg-brand-white p-5 sm:grid-cols-4 print:mt-6 print:border print:border-slate-200">
        <div className="col-span-2">
          <Dato label={t.para}>{propuesta.cliente.nombre ?? '—'}</Dato>
          {propuesta.cliente.contacto && <p className="text-xs text-dark-text/60">{propuesta.cliente.contacto}</p>}
          {propuesta.cliente.pais && <p className="text-xs text-dark-text/60">{propuesta.cliente.pais}</p>}
        </div>
        <Dato label={t.fecha}>{fechaDoc(propuesta.fecha, idioma)}</Dato>
        {propuesta.fechaVencimiento && <Dato label={etiquetaVence}>{fechaDoc(propuesta.fechaVencimiento, idioma)}</Dato>}
      </div>

      <div className="mt-8 print:mt-6">
        <p className="text-lg font-semibold">{propuesta.titulo}</p>
        {propuesta.resumen && <p className="mt-1 text-sm leading-relaxed text-dark-text/70">{propuesta.resumen}</p>}
      </div>
    </header>
  )
}

const SeccionDoc = ({
  numero,
  titulo,
  salto = false,
  children,
}: {
  numero: number | null
  titulo: string
  // La inversión arranca en página nueva al imprimir
  salto?: boolean
  children: ReactNode
}) => (
  <section className={salto ? 'print:break-before-page' : ''}>
    <header className="mb-5 flex items-baseline gap-4 break-after-avoid print:mb-3">
      {numero !== null && (
        <span className="font-display text-4xl font-semibold tabular-nums leading-none text-brand-blue">
          {String(numero).padStart(DIGITOS_SECCION, '0')}
        </span>
      )}
      <h2 className={`font-display font-semibold tracking-tight ${numero !== null ? 'text-2xl' : 'text-lg'}`}>{titulo}</h2>
    </header>
    {children}
  </section>
)

const TablaItems = ({ propuesta, idioma }: { propuesta: PropuestaPublica; idioma: Idioma }) => {
  const t = TEXTOS_PROPUESTA[idioma]
  const moneda = propuesta.moneda
  const totales = totalesPropuesta(propuesta.items, propuesta.descuento)
  const conPlazo = propuesta.items.some((i) => i.plazo)
  const conCantidad = propuesta.items.some((i) => i.cantidad !== 1)

  return (
    <div className="break-inside-avoid">
      <div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-dark-text text-left text-[0.6875rem] uppercase tracking-[0.14em] text-dark-text/60">
              <th className="py-2.5 pr-4 font-medium">{t.descripcion}</th>
              {conPlazo && <th className="hidden sm:table-cell print:table-cell py-2.5 pr-4 font-medium">{t.plazo}</th>}
              {conCantidad && <th className="hidden sm:table-cell print:table-cell py-2.5 pr-4 text-right font-medium">{t.cantidad}</th>}
              {conCantidad && <th className="hidden sm:table-cell print:table-cell py-2.5 pr-4 text-right font-medium">{t.precio}</th>}
              <th className="py-2.5 text-right font-medium">{t.importe}</th>
            </tr>
          </thead>
          <tbody>
            {propuesta.items.map((item, i) => (
              <tr key={i} className="border-b border-slate-100 align-top">
                <td className="py-3.5 pr-4">
                  <p className="font-medium">{item.descripcion}</p>
                  {item.detalle && <p className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-dark-text/60">{item.detalle}</p>}
                  {/* En mobile, plazo y cantidad van debajo (las columnas se ocultan) */}
                  {(item.plazo || item.cantidad !== 1) && (
                    <p className="mt-0.5 text-xs text-dark-text/50 sm:hidden print:hidden">
                      {[item.plazo, item.cantidad !== 1 && `${item.cantidad} × ${montoDoc(item.precio, moneda, idioma)}`].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </td>
                {conPlazo && <td className="hidden sm:table-cell print:table-cell whitespace-nowrap py-3.5 pr-4 text-dark-text/70">{item.plazo ?? '—'}</td>}
                {conCantidad && <td className="hidden sm:table-cell print:table-cell py-3.5 pr-4 text-right tabular-nums text-dark-text/70">{item.cantidad}</td>}
                {conCantidad && (
                  <td className="hidden sm:table-cell print:table-cell whitespace-nowrap py-3.5 pr-4 text-right tabular-nums text-dark-text/70">{montoDoc(item.precio, moneda, idioma)}</td>
                )}
                <td className="whitespace-nowrap py-3.5 text-right font-medium tabular-nums">{montoDoc(subtotalItem(item), moneda, idioma)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex justify-end">
        <dl className="w-full max-w-xs space-y-1.5 text-sm">
          {totales.descuento > 0 && (
            <>
              <div className="flex justify-between text-dark-text/70">
                <dt>{t.subtotal}</dt>
                <dd className="tabular-nums">{montoDoc(totales.subtotal, moneda, idioma)}</dd>
              </div>
              <div className="flex justify-between text-dark-text/70">
                <dt>{t.descuento}</dt>
                <dd className="tabular-nums">−{montoDoc(totales.descuento, moneda, idioma)}</dd>
              </div>
            </>
          )}
          <div className="flex items-center justify-between rounded-xl bg-dark-text px-4 py-3 text-white">
            <dt className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">{t.total}</dt>
            <dd className="text-lg font-semibold tabular-nums">{montoDoc(totales.total, moneda, idioma)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
