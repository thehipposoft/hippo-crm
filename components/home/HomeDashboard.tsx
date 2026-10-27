import Link from 'next/link'
import { SaldoProyecto } from '@/components/proyectos/SaldoProyecto'
import { StatusBadge } from '@/components/proyectos/StatusBadge'
import { pagosEsteMes } from '@/lib/analytics'
import {
  accionesPendientes,
  datosIncompletos,
  deadlinesProximos,
  DIAS_AVISO_DEADLINE,
  DIAS_AVISO_RENOVACION,
  porCobrar,
  recurrentesDelMes,
  renovacionesProximas,
} from '@/lib/dashboard'
import { diasEntre, hoy } from '@/lib/fechas'
import { formatCuota, formatFechaLarga, formatMonto, SUFIJO_FRECUENCIA } from '@/lib/format'
import type { CostoRow, Moneda, PagoRow, ProyectoRow } from '@/lib/types'
import { FechaRelativa, FilaLista, ListaSeccion, Seccion, TarjetaMontos } from '@/components/ui/Paneles'

const MAX_DEUDAS = 8
const MAX_INCOMPLETOS = 6

interface HomeDashboardProps {
  userName: string
  proyectos: ProyectoRow[]
  pagos: PagoRow[]
  costos: CostoRow[]
}

export const HomeDashboard = ({ userName, proyectos, pagos, costos }: HomeDashboardProps) => {
  const fechaHoy = hoy()
  const deadlines = deadlinesProximos(proyectos, fechaHoy)
  const renovaciones = renovacionesProximas(costos, fechaHoy)
  const acciones = accionesPendientes(proyectos)
  const deuda = porCobrar(proyectos, pagos, fechaHoy)
  const recurrentes = recurrentesDelMes(proyectos, pagos, fechaHoy)
  const incompletos = datosIncompletos(proyectos)

  const aCobrarEsteMes: Partial<Record<Moneda, number>> = {}
  for (const r of recurrentes) {
    aCobrarEsteMes[r.resumen.moneda] = (aCobrarEsteMes[r.resumen.moneda] ?? 0) + r.montoEsteMes
  }

  return (
    <div className="space-y-6 px-4 py-8 sm:px-8">
      <header>
        <h1 className="text-2xl font-semibold text-dark-text sm:text-3xl">
          Hola,{' '}
          <span className="bg-linear-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">{userName}</span>
        </h1>
        <p className="mt-1 text-sm text-dark-text/50">
          {formatFechaLarga(fechaHoy)} · esto es lo que necesita atención
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaMontos
          titulo="Por cobrar"
          montos={deuda.totales}
          vacio="Nada pendiente"
          ayuda="Saldo de proyectos activos, en pausa y cerrados"
        />
        <TarjetaMontos titulo="Cobrado este mes" montos={pagosEsteMes(pagos)} vacio="Todavía nada" />
        <TarjetaMontos
          titulo="Recurrentes a cobrar este mes"
          montos={aCobrarEsteMes}
          vacio="Sin cuotas este mes"
          ayuda="Cuotas que vencen este mes"
        />
      </div>

      {incompletos.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <h2 className="text-sm font-semibold text-amber-900">Datos para completar</h2>
          <p className="mt-0.5 text-xs text-amber-800/80">
            Sin estos datos los saldos y totales pueden no cerrar.
          </p>
          <ul className="mt-3 space-y-1">
            {incompletos.slice(0, MAX_INCOMPLETOS).map(({ proyecto, motivo }) => (
              <li key={proyecto.id} className="text-sm">
                <Link href={`/proyectos/${proyecto.id}/editar`} className="font-medium text-amber-900 underline-offset-2 hover:underline">
                  {proyecto.nombre}
                </Link>
                <span className="text-amber-800/80"> — {motivo}</span>
              </li>
            ))}
          </ul>
          {incompletos.length > MAX_INCOMPLETOS && (
            <p className="mt-2 text-xs text-amber-800/80">y {incompletos.length - MAX_INCOMPLETOS} más</p>
          )}
        </section>
      )}

      <Seccion
        titulo="Recurrentes"
        descripcion="Proyectos activos con cobro periódico"
        cantidad={recurrentes.length}
        vacio="No hay proyectos recurrentes activos."
      >
        {recurrentes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-dark-text/50">
                  <th className="px-5 py-3">Proyecto</th>
                  <th className="px-5 py-3">Cuota</th>
                  <th className="px-5 py-3">Este mes</th>
                  <th className="px-5 py-3">Próximo vencimiento</th>
                  <th className="px-5 py-3">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {recurrentes.map(({ proyecto, resumen, cuotasEsteMes, montoEsteMes, proximoVencimiento, unidadesEsteMes }) => (
                  <tr key={proyecto.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/proyectos/${proyecto.id}`} className="font-medium text-dark-text hover:text-brand-blue">
                        {proyecto.nombre}
                      </Link>
                      <p className="text-xs text-dark-text/50">{proyecto.clienteNombre}</p>
                    </td>
                    <td className="px-5 py-3 text-dark-text/60 tabular-nums">
                      {formatCuota(proyecto.valor, resumen.moneda, proyecto)}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {cuotasEsteMes === 0 ? (
                        <span className="text-dark-text/40">—</span>
                      ) : (
                        <>
                          {formatMonto(montoEsteMes, resumen.moneda)}
                          {unidadesEsteMes !== null ? (
                            <span className="text-xs text-dark-text/50">
                              {' '}
                              ({unidadesEsteMes} {proyecto.unidad}
                              {unidadesEsteMes === 1 ? '' : 's'})
                            </span>
                          ) : (
                            cuotasEsteMes > 1 && <span className="text-xs text-dark-text/50"> ({cuotasEsteMes} cuotas)</span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {proximoVencimiento ? (
                        <FechaRelativa fecha={proximoVencimiento} dias={diasEntre(fechaHoy, proximoVencimiento)} />
                      ) : (
                        <span className="text-xs text-dark-text/40">Contrato terminado</span>
                      )}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-dark-text/80">
                      <SaldoProyecto resumen={resumen} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Seccion
          titulo="Deadlines"
          descripcion={`Vencidos y próximos ${DIAS_AVISO_DEADLINE} días`}
          cantidad={deadlines.length}
          vacio="Ningún deadline cerca."
        >
          {deadlines.length > 0 && (
            <ListaSeccion>
              {deadlines.map(({ item: p, fecha, dias }) => (
                <FilaLista
                  key={p.id}
                  href={`/proyectos/${p.id}`}
                  titulo={p.nombre}
                  detalle={p.clienteNombre}
                  lateral={<FechaRelativa fecha={fecha} dias={dias} />}
                />
              ))}
            </ListaSeccion>
          )}
        </Seccion>

        <Seccion
          titulo="Renovaciones de costos"
          descripcion={`Próximos ${DIAS_AVISO_RENOVACION} días`}
          cantidad={renovaciones.length}
          verTodoHref="/costos"
          vacio="No hay renovaciones cerca."
        >
          {renovaciones.length > 0 && (
            <ListaSeccion>
              {renovaciones.map(({ item: c, fecha, dias }) => (
                <FilaLista
                  key={c.id}
                  href={`/costos/${c.id}`}
                  titulo={c.nombreCosto}
                  detalle={`${formatMonto(c.monto, c.moneda)} ${SUFIJO_FRECUENCIA[c.frecuencia]}`}
                  lateral={<FechaRelativa fecha={fecha} dias={dias} />}
                />
              ))}
            </ListaSeccion>
          )}
        </Seccion>

        <Seccion titulo="Acciones pendientes" cantidad={acciones.length} vacio="No hay acciones pendientes.">
          {acciones.length > 0 && (
            <ListaSeccion>
              {acciones.map((p) => (
                <FilaLista
                  key={p.id}
                  href={`/proyectos/${p.id}`}
                  titulo={p.nombre}
                  detalle={<span className="line-clamp-2">{p.accionPendiente}</span>}
                  lateral={<StatusBadge estado={p.estado} />}
                />
              ))}
            </ListaSeccion>
          )}
        </Seccion>

        <Seccion
          titulo="Por cobrar"
          descripcion="Proyectos con saldo pendiente"
          cantidad={deuda.deudas.length}
          verTodoHref="/proyectos"
          vacio="Nadie nos debe nada."
        >
          {deuda.deudas.length > 0 && (
            <ListaSeccion>
              {deuda.deudas.slice(0, MAX_DEUDAS).map(({ proyecto, resumen, monto }) => (
                <FilaLista
                  key={proyecto.id}
                  href={`/proyectos/${proyecto.id}`}
                  titulo={proyecto.nombre}
                  detalle={proyecto.clienteNombre}
                  lateral={
                    <span className="text-sm font-medium text-dark-text tabular-nums">{formatMonto(monto, resumen.moneda)}</span>
                  }
                />
              ))}
            </ListaSeccion>
          )}
        </Seccion>
      </div>
    </div>
  )
}
