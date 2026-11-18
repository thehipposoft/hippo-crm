import Image from 'next/image'
import type { ReactNode } from 'react'
import { EtiquetaSeccion, InsigniaH, StickerEmpezamos, StickerSimple } from '@/components/marca/Marca'
import { EMPRESA } from '@/lib/empresa'
import { fechaDoc, mesDoc, montoDoc, TEXTOS, type Idioma } from '@/lib/documentos/idioma'
import { TEXTOS_PROPUESTA } from '@/lib/documentos/textosPropuesta'
import { parseFecha } from '@/lib/fechas'
import { numeroPropuesta, subtotalItem, totalesPropuesta } from '@/lib/propuestas'
import type { PropuestaPublica } from '@/lib/types'
import { BotonImprimir } from './BotonImprimir'
import { IndicePropuesta, type EntradaIndice } from './IndicePropuesta'
import { ItemDesplegable } from './ItemDesplegable'
import { SeccionColapsable } from './SeccionColapsable'
import { Markdown } from './Markdown'

const DIGITOS_SECCION = 2
const ID_INICIO = 'inicio'
const ID_RESPUESTA = 'respuesta'

interface PropuestaInteractivaProps {
  propuesta: PropuestaPublica
  // Bloque de aceptar / rechazar (solo en el link público)
  respuesta?: ReactNode
  // Extras de la cabecera (vista previa del CRM: volver, aviso de borrador)
  cabecera?: ReactNode
}

const numero = (n: number) => String(n).padStart(DIGITOS_SECCION, '0')

const Flecha = ({ abajo = false }: { abajo?: boolean }) => (
  <svg className={`h-4 w-4 ${abajo ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
)

const Seccion = ({
  entrada,
  siguiente,
  etiquetaSiguiente,
  resumen,
  abiertaEnMobile = false,
  children,
}: {
  entrada: EntradaIndice
  siguiente: EntradaIndice | null
  etiquetaSiguiente: string
  resumen?: string
  abiertaEnMobile?: boolean
  children: ReactNode
}) => (
  <SeccionColapsable
    id={entrada.id}
    resumen={resumen}
    abiertaEnMobile={abiertaEnMobile}
    titulo={
      <>
        {entrada.numero && <span className="font-display text-sm font-semibold tabular-nums text-brand-blue">{entrada.numero}</span>}
        <span className="min-w-0">
          <EtiquetaSeccion>{entrada.titulo}</EtiquetaSeccion>
        </span>
      </>
    }
  >
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
      {children}
      {siguiente && (
        <div className="mt-8 flex justify-end border-t border-slate-100 pt-5">
          <a
            href={`#${siguiente.id}`}
            className="group flex items-center gap-2 text-sm font-medium text-dark-text/60 transition-colors hover:text-dark-text"
          >
            {etiquetaSiguiente}: <span className="text-dark-text">{siguiente.titulo}</span>
            <span className="transition-transform group-hover:translate-y-0.5">
              <Flecha abajo />
            </span>
          </a>
        </div>
      )}
    </div>
  </SeccionColapsable>
)

// Ítem de la inversión: con detalle se despliega (con transición)
const Item = ({ item, propuesta, idioma }: { item: PropuestaPublica['items'][number]; propuesta: PropuestaPublica; idioma: Idioma }) => {
  const moneda = propuesta.moneda
  const datos = [item.plazo, item.cantidad !== 1 ? `${item.cantidad} × ${montoDoc(item.precio, moneda, idioma)}` : null].filter(Boolean)
  // Spans (no divs ni párrafos): la fila puede ir dentro del botón del desplegable
  const fila = (
    <>
      <span className="block min-w-0 flex-1">
        <span className="block font-semibold">{item.descripcion}</span>
        {datos.length > 0 && (
          <span className="mt-1 flex flex-wrap gap-1.5">
            {datos.map((d) => (
              <span key={d} className="rounded-full bg-brand-white px-2.5 py-0.5 text-xs text-dark-text/70">
                {d}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="whitespace-nowrap font-semibold tabular-nums">{montoDoc(subtotalItem(item), moneda, idioma)}</span>
    </>
  )

  if (!item.detalle) return <li className="flex items-start gap-4 py-4">{fila}</li>
  return <ItemDesplegable fila={fila} detalle={item.detalle} />
}

// Versión en pantalla de la propuesta (link público y vista previa). Al imprimir se usa PropuestaDocumento.
export const PropuestaInteractiva = ({ propuesta, respuesta, cabecera }: PropuestaInteractivaProps) => {
  const idioma: Idioma = propuesta.idioma
  const t = TEXTOS_PROPUESTA[idioma]
  const fecha = parseFecha(propuesta.fecha)
  const totales = totalesPropuesta(propuesta.items, propuesta.descuento)
  const totalTexto = montoDoc(totales.total, propuesta.moneda, idioma)

  const entradas: EntradaIndice[] = [
    ...propuesta.secciones.map((s, i) => ({ id: `seccion-${i + 1}`, numero: numero(i + 1), titulo: s.titulo })),
    { id: 'inversion', numero: numero(propuesta.secciones.length + 1), titulo: t.inversion },
    ...(propuesta.cuentas.length > 0 ? [{ id: 'pago', numero: null, titulo: t.datosDePago }] : []),
    ...(propuesta.notas ? [{ id: 'condiciones', numero: null, titulo: t.condiciones }] : []),
    ...(respuesta ? [{ id: ID_RESPUESTA, numero: null, titulo: t.tuRespuestaIndice }] : []),
  ]
  const siguienteDe = (id: string) => entradas[entradas.findIndex((e) => e.id === id) + 1] ?? null
  const entrada = (id: string) => entradas.find((e) => e.id === id) as EntradaIndice

  return (
    <div id={ID_INICIO} className="propuesta-interactiva pb-28 text-dark-text lg:pb-16">
      <div className="progreso-lectura fixed inset-x-0 top-0 z-40 h-1 bg-brand-blue" aria-hidden />

      {/* Portada */}
      <header className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 py-5">
          <Image src={EMPRESA.logo} alt={EMPRESA.nombre} width={EMPRESA.logoAncho} height={EMPRESA.logoAlto} priority />
          <div className="flex flex-wrap items-center gap-2">
            {cabecera}
            <BotonImprimir className="rounded-lg border border-dark-text/20 bg-white px-3.5 py-2 text-xs font-semibold transition hover:border-dark-text">
              {TEXTOS[idioma].descargarPdf}
            </BotonImprimir>
          </div>
        </div>

        <div className="grid gap-10 pb-14 pt-8 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16 lg:pb-20">
          <div>
            <p className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-dark-text/50">
              <span className="rounded-full border border-dark-text/20 px-3 py-1 tracking-[0.16em] text-dark-text/70">
                {t.PROPUESTA} · {fecha ? mesDoc(fecha, idioma) : ''}
              </span>
              {propuesta.cliente.nombre && (
                <span>
                  {t.preparadaPara} <span className="text-dark-text">{propuesta.cliente.nombre}</span>
                </span>
              )}
            </p>
            <h1 className="mt-6 max-w-[18ch] font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {propuesta.titulo}
              <span className="ml-[0.12em] inline-block h-[0.2em] w-[0.2em] bg-brand-blue" aria-hidden />
            </h1>
            {propuesta.resumen && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dark-text/70">{propuesta.resumen}</p>}

            <dl className="mt-8 flex flex-wrap gap-2 text-sm">
              {[
                [t.numero, numeroPropuesta(propuesta)],
                [t.fecha, fechaDoc(propuesta.fecha, idioma)],
                ...(propuesta.fechaVencimiento ? [[t.validaHasta, fechaDoc(propuesta.fechaVencimiento, idioma)]] : []),
                [t.total, totalTexto],
              ].map(([etiqueta, valor]) => (
                <div key={etiqueta} className="rounded-full bg-white px-4 py-2 ring-1 ring-slate-200">
                  <dt className="inline text-dark-text/50">{etiqueta} </dt>
                  <dd className="inline font-semibold tabular-nums">{valor}</dd>
                </div>
              ))}
            </dl>

            {/* En mobile el sticker va al lado del botón, más chico */}
            <div className="mt-10 flex items-center justify-between gap-3">
              <a
                href={`#${entradas[0].id}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-dark-text px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-dark-text/85"
              >
                {t.empezar}
                <Flecha abajo />
              </a>
              <StickerEmpezamos idioma={idioma} className="-my-10 origin-right scale-[0.7] lg:hidden" />
            </div>
          </div>
          <div className="hidden lg:block">
            <StickerEmpezamos idioma={idioma} className="mb-4" />
          </div>
        </div>
      </header>

      {/* Índice + contenido */}
      <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
        <IndicePropuesta
          entradas={entradas}
          etiquetaContenido={t.contenido}
          total={{ etiqueta: t.total, monto: totalTexto }}
          responder={respuesta ? { id: ID_RESPUESTA, etiqueta: t.responder } : null}
        />

        <div className="mt-8 space-y-6 lg:mt-0 lg:space-y-16">
          {propuesta.secciones.map((seccion, i) => {
            const e = entradas[i]
            return (
              <Seccion key={e.id} entrada={e} siguiente={siguienteDe(e.id)} etiquetaSiguiente={t.siguiente} abiertaEnMobile={i === 0}>
                <Markdown texto={seccion.contenido} />
              </Seccion>
            )
          })}

          <Seccion
            entrada={entrada('inversion')}
            siguiente={siguienteDe('inversion')}
            etiquetaSiguiente={t.siguiente}
            resumen={totalTexto}
            abiertaEnMobile={propuesta.secciones.length === 0}
          >
            <ul className="divide-y divide-slate-100">
              {propuesta.items.map((item, i) => (
                <Item key={i} item={item} propuesta={propuesta} idioma={idioma} />
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t-2 border-dark-text pt-4 text-sm">
              {totales.descuento > 0 && (
                <>
                  <div className="flex justify-between text-dark-text/70">
                    <dt>{t.subtotal}</dt>
                    <dd className="tabular-nums">{montoDoc(totales.subtotal, propuesta.moneda, idioma)}</dd>
                  </div>
                  <div className="flex justify-between text-dark-text/70">
                    <dt>{t.descuento}</dt>
                    <dd className="tabular-nums">−{montoDoc(totales.descuento, propuesta.moneda, idioma)}</dd>
                  </div>
                </>
              )}
              <div className="mt-4! flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-dark-text px-5 py-4 text-white">
                <dt className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">{t.total}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{totalTexto}</dd>
              </div>
            </dl>
            {propuesta.fechaVencimiento && (
              <p className="mt-3 text-sm text-dark-text/60">
                {t.validaHasta}: <span className="font-medium text-dark-text">{fechaDoc(propuesta.fechaVencimiento, idioma)}</span>
              </p>
            )}
          </Seccion>

          {propuesta.cuentas.length > 0 && (
            <Seccion entrada={entrada('pago')} siguiente={siguienteDe('pago')} etiquetaSiguiente={t.siguiente}>
              <div className="grid gap-3 sm:grid-cols-2">
                {propuesta.cuentas.map((cuenta, i) => (
                  <div key={i} className="rounded-2xl bg-brand-white p-4">
                    <p className="text-sm font-semibold">{cuenta.nombre}</p>
                    <p className="mt-1.5 whitespace-pre-line break-words font-mono text-xs leading-relaxed text-dark-text/70">{cuenta.detalle}</p>
                  </div>
                ))}
              </div>
            </Seccion>
          )}

          {propuesta.notas && (
            <Seccion entrada={entrada('condiciones')} siguiente={siguienteDe('condiciones')} etiquetaSiguiente={t.siguiente}>
              <Markdown texto={propuesta.notas} />
            </Seccion>
          )}

          {respuesta && (
            <section id={ID_RESPUESTA} className="relative scroll-mt-20 pt-6 lg:scroll-mt-8">
              <StickerSimple idioma={idioma} className="absolute -top-8 right-2 z-10 w-24 rotate-6 sm:-top-12 sm:right-6 sm:w-36" />
              <div className="rounded-3xl bg-white">{respuesta}</div>
            </section>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-dark-text/50">
            <div className="flex items-center gap-3">
              <InsigniaH />
              <p>
                {t.consultas}: {EMPRESA.email} · {EMPRESA.web}
              </p>
            </div>
            <a href={`#${ID_INICIO}`} className="font-medium text-dark-text/60 hover:text-dark-text">
              ↑ {t.volverArriba}
            </a>
          </footer>
        </div>
      </div>
    </div>
  )
}
