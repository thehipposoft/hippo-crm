import Link from 'next/link'
import { Field } from '@/components/ui/Field'
import { FechaRelativa, FilaLista, ListaSeccion, Seccion, TarjetaMontos } from '@/components/ui/Paneles'
import { ProyectosTable } from '@/components/proyectos/ProyectosTable'
import { SaldoProyecto } from '@/components/proyectos/SaldoProyecto'
import { resumenCliente, ULTIMOS_PAGOS } from '@/lib/clientes'
import { diasEntre, hoy } from '@/lib/fechas'
import { formatFecha, formatMonto, SUFIJO_FRECUENCIA } from '@/lib/format'
import type { ClienteRow, PagoRow, ProyectoRow } from '@/lib/types'
import { wpGet, wpGetONotFound } from '@/lib/wp'

const CLASES_BOTON_SECUNDARIO =
  'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-dark-text transition-colors hover:bg-brand-blue/10'

export default async function ClienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cliente = await wpGetONotFound<ClienteRow>(`/clientes/${id}`)

  const [proyectos, pagos] = await Promise.all([
    wpGet<ProyectoRow[]>(`/clientes/${id}/proyectos`),
    wpGet<PagoRow[]>('/pagos'),
  ])

  const fechaHoy = hoy()
  const resumen = resumenCliente(proyectos, pagos, fechaHoy)

  return (
    <div className="max-w-5xl space-y-6 px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/clientes" className="text-xs text-dark-text/50 transition-colors hover:text-dark-text">
            ← Volver a clientes
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-dark-text">{cliente.nombre}</h1>
          {cliente.pais && <p className="text-sm text-dark-text/50">{cliente.pais}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/documentos/estado-de-cuenta/${cliente.id}`} className={CLASES_BOTON_SECUNDARIO}>
            Estado de cuenta
          </Link>
          <Link href={`/clientes/${cliente.id}/editar`} className={CLASES_BOTON_SECUNDARIO}>
            Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaMontos titulo="Por cobrar" montos={resumen.porCobrar.totales} vacio="Nada pendiente" />
        <TarjetaMontos titulo={`Cobrado en ${fechaHoy.anio}`} montos={resumen.cobradoEsteAnio} vacio="Todavía nada" />
        <TarjetaMontos titulo="Cobrado histórico" montos={resumen.cobradoTotal} vacio="Sin pagos" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            <Field label="Contacto" value={cliente.contacto || '—'} />
            <Field
              label="Teléfono"
              value={
                cliente.telefono ? (
                  <a href={`tel:${cliente.telefono}`} className="text-brand-blue hover:brightness-90">
                    {cliente.telefono}
                  </a>
                ) : (
                  '—'
                )
              }
            />
            <Field
              label="Email"
              value={
                cliente.emailContacto ? (
                  <a href={`mailto:${cliente.emailContacto}`} className="break-all text-brand-blue hover:brightness-90">
                    {cliente.emailContacto}
                  </a>
                ) : (
                  '—'
                )
              }
            />
          </section>

          <Seccion
            titulo="Recurrentes"
            cantidad={resumen.recurrentes.length}
            vacio="Sin proyectos recurrentes activos."
          >
            {resumen.recurrentes.length > 0 && (
              <ListaSeccion>
                {resumen.recurrentes.map(({ proyecto, resumen: r, proximoVencimiento }) => (
                  <FilaLista
                    key={proyecto.id}
                    href={`/proyectos/${proyecto.id}`}
                    titulo={proyecto.nombre}
                    detalle={
                      <>
                        {formatMonto(proyecto.valor, r.moneda)} {SUFIJO_FRECUENCIA[proyecto.frecuenciaPago ?? 'MENSUAL']} ·{' '}
                        <SaldoProyecto resumen={r} />
                      </>
                    }
                    lateral={
                      proximoVencimiento ? (
                        <FechaRelativa fecha={proximoVencimiento} dias={diasEntre(fechaHoy, proximoVencimiento)} />
                      ) : (
                        <span className="text-xs text-dark-text/40">Terminado</span>
                      )
                    }
                  />
                ))}
              </ListaSeccion>
            )}
          </Seccion>
        </div>

        <Seccion
          titulo="Últimos pagos"
          cantidad={resumen.pagos.length}
          verTodoHref={resumen.pagos.length > ULTIMOS_PAGOS ? `/pagos?q=${encodeURIComponent(cliente.nombre)}` : undefined}
          vacio="Todavía no hay pagos."
        >
          {resumen.pagos.length > 0 && (
            <ListaSeccion>
              {resumen.pagos.slice(0, ULTIMOS_PAGOS).map((p) => (
                <FilaLista
                  key={p.id}
                  href={`/pagos/${p.id}`}
                  titulo={formatMonto(p.monto, p.moneda)}
                  detalle={p.proyectoNombre}
                  lateral={<span className="text-xs text-dark-text/60 tabular-nums">{formatFecha(p.fecha)}</span>}
                />
              ))}
            </ListaSeccion>
          )}
        </Seccion>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-dark-text">Proyectos</h2>
        <ProyectosTable proyectos={proyectos} pagos={pagos} mostrarCliente={false} />
      </section>
    </div>
  )
}
