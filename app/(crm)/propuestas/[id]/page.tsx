import Link from 'next/link'
import { AccionesPropuesta } from '@/components/propuestas/AccionesPropuesta'
import { EstadoPropuestaBadge } from '@/components/propuestas/EstadoPropuestaBadge'
import { fechaEnZona, hoy } from '@/lib/fechas'
import { formatFecha, formatMonto } from '@/lib/format'
import { estadoVisible, numeroPropuesta, subtotalItem, totalesPropuesta } from '@/lib/propuestas'
import type { PropuestaRow } from '@/lib/types'
import { wpGetONotFound } from '@/lib/wp'

const BOTON = 'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-dark-text transition-colors hover:bg-brand-blue/10'

// Fecha y hora UTC → "3 nov. 2026, 14:20" en Argentina
const formatInstante = (iso: string | null): string | null => {
  if (!iso || !fechaEnZona(iso)) return null
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default async function PropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const propuesta = await wpGetONotFound<PropuestaRow>(`/propuestas/${id}`)
  const estado = estadoVisible(propuesta, hoy())
  const totales = totalesPropuesta(propuesta.items, propuesta.descuento)
  const esPropuesta = propuesta.tipo === 'PROPUESTA'

  const historial = [
    { label: 'Fecha del documento', valor: formatFecha(propuesta.fecha) },
    { label: 'Enviada', valor: formatInstante(propuesta.enviadaEl) },
    { label: 'Vista por el cliente', valor: formatInstante(propuesta.vistaEl) },
    {
      label: propuesta.estado === 'RECHAZADA' ? 'Rechazada' : 'Aceptada',
      valor: propuesta.estado === 'ACEPTADA' || propuesta.estado === 'RECHAZADA' ? formatInstante(propuesta.respondidaEl) : null,
      detalle: propuesta.respuestaNombre,
      comentario: propuesta.respuestaComentario,
    },
  ]

  return (
    <div className="max-w-5xl px-4 py-8 sm:px-8">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/propuestas" className="text-xs text-dark-text/50 transition-colors hover:text-dark-text">
            ← Volver a propuestas
          </Link>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-dark-text/50">
            {esPropuesta ? 'Propuesta' : 'Cotización'} · {numeroPropuesta(propuesta)}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-dark-text">{propuesta.titulo}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <EstadoPropuestaBadge estado={estado} vista={!!propuesta.vistaEl} />
            {propuesta.clienteId && (
              <Link href={`/clientes/${propuesta.clienteId}`} className="text-dark-text/60 hover:text-dark-text">
                {propuesta.clienteNombre}
              </Link>
            )}
            {propuesta.proyectoId && (
              <Link href={`/proyectos/${propuesta.proyectoId}`} className="text-dark-text/60 hover:text-dark-text">
                · {propuesta.proyectoNombre}
              </Link>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/documentos/propuesta/${propuesta.id}`} className={BOTON}>
            Ver documento
          </Link>
          <Link href={`/propuestas/${propuesta.id}/editar`} className="rounded-lg bg-dark-text px-4 py-2 text-sm font-medium text-white transition hover:bg-dark-text/85">
            Editar
          </Link>
        </div>
      </div>

      {propuesta.estado === 'ACEPTADA' && !propuesta.proyectoId && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-forest/25 bg-brand-forest/5 px-5 py-4">
          <p className="text-sm text-brand-forest">¡Aceptada! ¿La pasamos a proyecto?</p>
          <Link
            href={`/proyectos/nuevo?desde=${propuesta.id}`}
            className="rounded-lg bg-brand-forest px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-forest/90"
          >
            Crear proyecto
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <AccionesPropuesta propuesta={propuesta} />

          <section className="rounded-2xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-dark-text">{esPropuesta ? 'Inversión' : 'Ítems'}</h2>
              <span className="text-xs text-dark-text/50">
                {propuesta.secciones.length > 0 && `${propuesta.secciones.length} secciones · `}
                {propuesta.items.length} ítems
              </span>
            </header>
            <ul className="divide-y divide-slate-100">
              {propuesta.items.map((item, i) => (
                <li key={i} className="flex items-start justify-between gap-4 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-dark-text">{item.descripcion}</p>
                    <p className="text-xs text-dark-text/50">
                      {[item.plazo, item.cantidad !== 1 && `${item.cantidad} × ${formatMonto(item.precio, propuesta.moneda)}`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="whitespace-nowrap tabular-nums text-dark-text">{formatMonto(subtotalItem(item), propuesta.moneda)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
              <span className="text-sm text-dark-text/60">
                Total{totales.descuento > 0 && ` (descuento ${formatMonto(totales.descuento, propuesta.moneda)})`}
              </span>
              <span className="text-lg font-semibold tabular-nums text-dark-text">{formatMonto(totales.total, propuesta.moneda)}</span>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-dark-text">Historial</h2>
            <ol className="space-y-4">
              {historial.map((paso) => (
                <li key={paso.label} className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 ${paso.valor ? 'bg-brand-blue' : 'bg-slate-200'}`} aria-hidden />
                  <div className="min-w-0 text-sm">
                    <p className={paso.valor ? 'font-medium text-dark-text' : 'text-dark-text/40'}>{paso.label}</p>
                    <p className="text-xs text-dark-text/50">{paso.valor ?? 'Todavía no'}</p>
                    {paso.valor && paso.detalle && <p className="mt-1 text-xs text-dark-text/70">Firmó: {paso.detalle}</p>}
                    {paso.valor && paso.comentario && (
                      <p className="mt-1 rounded-lg bg-brand-white px-3 py-2 text-xs italic text-dark-text/70">&ldquo;{paso.comentario}&rdquo;</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-dark-text/50">{esPropuesta ? 'Válida hasta' : 'Vencimiento'}</dt>
                <dd className="font-medium text-dark-text">{formatFecha(propuesta.fechaVencimiento)}</dd>
              </div>
              <div>
                <dt className="text-xs text-dark-text/50">Idioma</dt>
                <dd className="font-medium text-dark-text">{propuesta.idioma === 'es' ? 'Español' : 'Inglés'}</dd>
              </div>
              <div>
                <dt className="text-xs text-dark-text/50">Datos bancarios</dt>
                <dd className="font-medium text-dark-text">{propuesta.cuentas.length === 0 ? 'Ninguno' : `${propuesta.cuentas.length} cuenta(s)`}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}
