'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ProyectoRow, Estado, PagoRow } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { ProyectoRowActions } from './ProyectoRowActions'
import { SaldoProyecto } from './SaldoProyecto'
import { SearchInput } from '@/components/ui/SearchInput'
import { ContenedorTabla, FilaTabla } from '@/components/ui/FilaTabla'
import { ThOrdenable, useOrdenTabla } from '@/components/ui/Orden'
import { formatCuota, formatFecha, formatMonto } from '@/lib/format'
import { claveFecha, type ColumnaOrden } from '@/lib/orden'
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

const formatValor = (proyecto: ProyectoRow, resumen: ResumenPendiente): string =>
  formatCuota(proyecto.valor, resumen.moneda, proyecto)

const formatOtrasMonedas = (resumen: ResumenPendiente): string | null => {
  const lineas = Object.entries(resumen.otrasMonedas).map(([moneda, monto]) => formatMonto(monto, moneda))
  return lineas.length > 0 ? `+ ${lineas.join(' + ')} sin descontar` : null
}

// Orden "de trabajo": lo activo primero
const ORDEN_ESTADO: Record<Estado, number> = {
  ACTIVO: 0,
  EN_NEGOCIACION: 1,
  EN_PAUSA: 2,
  PROSPECTO: 3,
  CERRADO: 4,
  PERDIDO: 5,
}

type FilaProyecto = { proyecto: ProyectoRow; resumen: ResumenPendiente }

// Montos: primero agrupa por moneda (no se comparan US$ con $ argentinos)
const COLUMNAS = {
  nombre: { valor: ({ proyecto }) => proyecto.nombre, direccionInicial: 'asc' },
  cliente: { valor: ({ proyecto }) => proyecto.clienteNombre, direccionInicial: 'asc' },
  estado: { valor: ({ proyecto }) => ORDEN_ESTADO[proyecto.estado], direccionInicial: 'asc' },
  inicio: { valor: ({ proyecto }) => claveFecha(proyecto.fechaInicio), direccionInicial: 'desc' },
  deadline: { valor: ({ proyecto }) => claveFecha(proyecto.deadline), direccionInicial: 'asc' },
  valor: { valor: ({ proyecto, resumen }) => [resumen.moneda, proyecto.valor], direccionInicial: 'desc' },
  saldo: { valor: ({ resumen }) => [resumen.moneda, resumen.pendiente], direccionInicial: 'desc' },
} satisfies Record<string, ColumnaOrden<FilaProyecto>>

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
  const [filtro, setFiltro] = useState<Estado | 'TODOS'>('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const { orden, cambiarOrden, ordenar } = useOrdenTabla(COLUMNAS, { columna: 'estado', direccion: 'asc' })

  const filas = ordenar(
    proyectos
      .filter((p) => filtro === 'TODOS' || p.estado === filtro)
      .filter((p) => coincide(p, busqueda))
      .map((proyecto) => ({ proyecto, resumen: resumenPendiente(proyecto, pagos) }))
  )

  const columnCount = mostrarCliente ? 8 : 7
  const thProps = { orden, onOrdenar: cambiarOrden, compacto: true }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTROS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFiltro(value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filtro === value
                  ? 'bg-brand-blue text-white'
                  : 'border border-slate-200 bg-white text-dark-text/60 hover:bg-brand-blue/10 hover:text-dark-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre o cliente..." />
      </div>

      <ContenedorTabla>
        <table className="w-full min-w-3xl text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-brand-white">
              <ThOrdenable id="nombre" {...thProps}>Nombre</ThOrdenable>
              {mostrarCliente && <ThOrdenable id="cliente" {...thProps}>Cliente</ThOrdenable>}
              <ThOrdenable id="estado" {...thProps}>Estado</ThOrdenable>
              <ThOrdenable id="inicio" {...thProps}>Inicio</ThOrdenable>
              <ThOrdenable id="deadline" {...thProps}>Deadline</ThOrdenable>
              <ThOrdenable id="valor" {...thProps}>Valor</ThOrdenable>
              <ThOrdenable id="saldo" {...thProps}>Saldo</ThOrdenable>
              <th className="w-12 px-2 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-5 py-14 text-center text-sm text-dark-text/40">
                  No hay proyectos en esta categoría.
                </td>
              </tr>
            ) : (
              filas.map(({ proyecto, resumen }) => {
                const otrasMonedas = formatOtrasMonedas(resumen)
                return (
                  <FilaTabla key={proyecto.id} href={`/proyectos/${proyecto.id}`}>
                    <td className="w-52 max-w-52 px-3 py-4">
                      <Link href={`/proyectos/${proyecto.id}`} className="font-medium text-dark-text hover:text-brand-blue">
                        {proyecto.nombre}
                      </Link>
                      {proyecto.accionPendiente && (
                        <p className="mt-0.5 truncate text-xs text-dark-text/50" title={proyecto.accionPendiente}>
                          {proyecto.accionPendiente}
                        </p>
                      )}
                    </td>
                    {mostrarCliente && <td className="px-3 py-4 text-dark-text/60">{proyecto.clienteNombre}</td>}
                    <td className="px-3 py-4">
                      <StatusBadge estado={proyecto.estado} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-dark-text/60 tabular-nums">
                      {formatFecha(proyecto.fechaInicio)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-dark-text/60 tabular-nums">
                      {formatFecha(proyecto.deadline)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-dark-text/60 tabular-nums">{formatValor(proyecto, resumen)}</td>
                    <td className="px-3 py-4 text-dark-text/60 tabular-nums">
                      <SaldoProyecto resumen={resumen} />
                      {otrasMonedas && <span className="block text-xs text-dark-text/40">{otrasMonedas}</span>}
                    </td>
                    <td className="px-2 py-4" data-sin-navegar>
                      <ProyectoRowActions proyectoId={proyecto.id} estado={proyecto.estado} />
                    </td>
                  </FilaTabla>
                )
              })
            )}
          </tbody>
        </table>
      </ContenedorTabla>
    </div>
  )
}
