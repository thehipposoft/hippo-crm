'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProyectoRow, Estado, FrecuenciaPago, PagoRow } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { ProyectoRowActions } from './ProyectoRowActions'
import { SearchInput } from '@/components/ui/SearchInput'
import { formatMonto } from '@/lib/format'
import { resumenPendiente, type ResumenPendiente } from '@/lib/proyectos'

const FILTROS: { label: string; value: Estado | 'TODOS' }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Prospecto', value: 'PROSPECTO' },
  { label: 'En negociación', value: 'EN_NEGOCIACION' },
  { label: 'Activo', value: 'ACTIVO' },
  { label: 'En pausa', value: 'EN_PAUSA' },
  { label: 'Cerrado', value: 'CERRADO' },
  { label: 'Perdido', value: 'PERDIDO' },
]

const truncate = (text: string, max: number): string =>
  text.length > max ? text.slice(0, max) + '…' : text

const FRECUENCIA_SUFIJO: Record<FrecuenciaPago, string> = {
  SEMANAL: '/ semana',
  MENSUAL: '/ mes',
  ANUAL: '/ año',
}

const formatValor = (proyecto: ProyectoRow, resumen: ResumenPendiente): string => {
  const monto = formatMonto(proyecto.valor, resumen.moneda)
  if (proyecto.tipoProyecto === 'RECURRENTE' && proyecto.frecuenciaPago) {
    return `${monto} ${FRECUENCIA_SUFIJO[proyecto.frecuenciaPago]}`
  }
  return monto
}

const formatOtrasMonedas = (resumen: ResumenPendiente): string | null => {
  const lineas = Object.entries(resumen.otrasMonedas).map(([moneda, monto]) => formatMonto(monto, moneda))
  return lineas.length > 0 ? `+ ${lineas.join(' + ')} sin descontar` : null
}

const ORDEN_ESTADO: Record<Estado, number> = {
  ACTIVO: 0,
  EN_NEGOCIACION: 1,
  EN_PAUSA: 2,
  PROSPECTO: 3,
  CERRADO: 4,
  PERDIDO: 5,
}

const coincide = (proyecto: ProyectoRow, query: string): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [proyecto.nombre, proyecto.clienteNombre]
    .filter((campo): campo is string => Boolean(campo))
    .some((campo) => campo.toLowerCase().includes(q))
}

interface ProyectosTableProps {
  proyectos: ProyectoRow[]
  pagos: PagoRow[]
  mostrarCliente?: boolean
}

export const ProyectosTable = ({ proyectos, pagos, mostrarCliente = true }: ProyectosTableProps) => {
  const router = useRouter()
  const [filtro, setFiltro] = useState<Estado | 'TODOS'>('TODOS')
  const [busqueda, setBusqueda] = useState('')

  const filtered = proyectos
    .filter((p) => filtro === 'TODOS' || p.estado === filtro)
    .filter((p) => coincide(p, busqueda))
    .sort((a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado])

  const columnCount = mostrarCliente ? 7 : 6

  return (
    <div>
      {/* Filter pills + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {FILTROS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filtro === value
                  ? 'bg-brand-blue text-white'
                  : 'bg-white border border-slate-200 text-dark-text/60 hover:bg-brand-blue/10 hover:text-dark-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre o cliente..." />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-brand-white">
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Nombre
              </th>
              {mostrarCliente && (
                <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                  Cliente
                </th>
              )}
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Monto pendiente
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Acción pendiente
              </th>
              <th className="px-3 py-3.5 w-12" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-5 py-14 text-center text-sm text-dark-text/40"
                >
                  No hay proyectos en esta categoría.
                </td>
              </tr>
            ) : (
              filtered.map((proyecto) => {
                const resumen = resumenPendiente(proyecto, pagos)
                const otrasMonedas = formatOtrasMonedas(resumen)
                return (
                <tr
                  key={proyecto.id}
                  onClick={() => router.push(`/proyectos/${proyecto.id}`)}
                  className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-brand-white transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-medium text-dark-text">
                      {proyecto.nombre}
                    </span>
                  </td>
                  {mostrarCliente && (
                    <td className="px-5 py-4 text-dark-text/60">
                      {proyecto.clienteNombre}
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <StatusBadge estado={proyecto.estado} />
                  </td>
                  <td className="px-5 py-4 text-dark-text/60 tabular-nums">
                    {formatValor(proyecto, resumen)}
                  </td>
                  <td className="px-5 py-4 text-dark-text/60 tabular-nums">
                    {formatMonto(resumen.pendiente, resumen.moneda)}
                    {otrasMonedas && (
                      <span className="block text-xs text-dark-text/40">{otrasMonedas}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 max-w-xs text-dark-text/60">
                    {proyecto.accionPendiente ? truncate(proyecto.accionPendiente, 60) : '—'}
                  </td>
                  <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                    <ProyectoRowActions proyectoId={proyecto.id} />
                  </td>
                </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
