'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { ContenedorTabla, FilaTabla } from '@/components/ui/FilaTabla'
import { ThOrdenable, useOrdenTabla } from '@/components/ui/Orden'
import { RowActions } from '@/components/ui/RowActions'
import { useParamsUrl } from '@/components/ui/useParamsUrl'
import { parseFecha, type FechaCalendario } from '@/lib/fechas'
import { formatFecha, formatMonto } from '@/lib/format'
import { claveFecha, type ColumnaOrden } from '@/lib/orden'
import { ESTADOS_VISIBLES, estadoVisible, numeroPropuesta, totalesPropuesta, type EstadoVisible } from '@/lib/propuestas'
import { TIPOS_PROPUESTA, type PropuestaRow } from '@/lib/types'
import { EstadoPropuestaBadge } from './EstadoPropuestaBadge'

type Fila = { propuesta: PropuestaRow; estado: EstadoVisible; total: number }

const COLUMNAS = {
  numero: { valor: ({ propuesta }) => propuesta.id, direccionInicial: 'desc' },
  titulo: { valor: ({ propuesta }) => propuesta.titulo, direccionInicial: 'asc' },
  cliente: { valor: ({ propuesta }) => propuesta.clienteNombre, direccionInicial: 'asc' },
  total: { valor: ({ propuesta, total }) => [propuesta.moneda ?? '', total], direccionInicial: 'desc' },
  estado: { valor: ({ estado }) => ESTADOS_VISIBLES.findIndex((e) => e.value === estado), direccionInicial: 'asc' },
  fecha: { valor: ({ propuesta }) => claveFecha(propuesta.fecha), direccionInicial: 'desc' },
  vence: { valor: ({ propuesta }) => claveFecha(propuesta.fechaVencimiento), direccionInicial: 'asc' },
} satisfies Record<string, ColumnaOrden<Fila>>

const Chip = ({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={activo}
    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
      activo ? 'bg-dark-text text-white' : 'border border-slate-200 bg-white text-dark-text/60 hover:bg-brand-blue/10 hover:text-dark-text'
    }`}
  >
    {children}
  </button>
)

interface PropuestasTableProps {
  propuestas: PropuestaRow[]
  hoyIso: string
}

export const PropuestasTable = ({ propuestas, hoyIso }: PropuestasTableProps) => {
  const params = useParamsUrl()
  const fechaHoy = parseFecha(hoyIso) as FechaCalendario
  const { orden, cambiarOrden, ordenar } = useOrdenTabla(COLUMNAS, { columna: 'fecha', direccion: 'desc' })

  const tipo = TIPOS_PROPUESTA.find((t) => t.value === params.get('tipo'))?.value ?? null
  const estado = ESTADOS_VISIBLES.find((e) => e.value === params.get('estado'))?.value ?? null

  const todas: Fila[] = propuestas.map((propuesta) => ({
    propuesta,
    estado: estadoVisible(propuesta, fechaHoy),
    total: totalesPropuesta(propuesta.items, propuesta.descuento).total,
  }))
  const delTipo = todas.filter((f) => !tipo || f.propuesta.tipo === tipo)
  const filas = ordenar(delTipo.filter((f) => !estado || f.estado === estado))
  const thProps = { orden, onOrdenar: cambiarOrden }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex flex-wrap gap-2">
          <Chip activo={!tipo} onClick={() => params.set({ tipo: null })}>
            Todo
          </Chip>
          {TIPOS_PROPUESTA.map((t) => (
            <Chip key={t.value} activo={tipo === t.value} onClick={() => params.set({ tipo: t.value })}>
              {t.label === 'Propuesta' ? 'Propuestas' : 'Cotizaciones'}
            </Chip>
          ))}
        </div>
        <span className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />
        <div className="flex flex-wrap gap-2">
          {ESTADOS_VISIBLES.map((e) => {
            const cantidad = delTipo.filter((f) => f.estado === e.value).length
            if (cantidad === 0 && estado !== e.value) return null
            return (
              <Chip key={e.value} activo={estado === e.value} onClick={() => params.set({ estado: estado === e.value ? null : e.value })}>
                {e.label} ({cantidad})
              </Chip>
            )
          })}
        </div>
      </div>

      <ContenedorTabla>
        <table className="w-full min-w-4xl text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-brand-white">
              <ThOrdenable id="numero" {...thProps}>N.º</ThOrdenable>
              <ThOrdenable id="titulo" {...thProps}>Título</ThOrdenable>
              <ThOrdenable id="cliente" {...thProps}>Cliente</ThOrdenable>
              <ThOrdenable id="total" {...thProps}>Total</ThOrdenable>
              <ThOrdenable id="estado" {...thProps}>Estado</ThOrdenable>
              <ThOrdenable id="fecha" {...thProps}>Fecha</ThOrdenable>
              <ThOrdenable id="vence" {...thProps}>Vence</ThOrdenable>
              <th className="w-12 px-3 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-14 text-center text-sm text-dark-text/40">
                  {propuestas.length === 0 ? 'Todavía no hay propuestas ni cotizaciones.' : 'No hay nada con este filtro.'}
                </td>
              </tr>
            ) : (
              filas.map(({ propuesta: p, estado: e, total }) => (
                <FilaTabla key={p.id} href={`/propuestas/${p.id}`}>
                  <td className="whitespace-nowrap px-5 py-4 text-xs tabular-nums text-dark-text/50">{numeroPropuesta(p)}</td>
                  <td className="px-5 py-4">
                    <Link href={`/propuestas/${p.id}`} className="font-medium text-dark-text hover:text-brand-blue">
                      {p.titulo}
                    </Link>
                    <p className="text-xs text-dark-text/40">{p.tipo === 'PROPUESTA' ? 'Propuesta' : 'Cotización'}</p>
                  </td>
                  <td className="px-5 py-4 text-dark-text/70">{p.clienteNombre ?? '—'}</td>
                  <td className="whitespace-nowrap px-5 py-4 tabular-nums text-dark-text">{p.moneda ? formatMonto(total, p.moneda) : '—'}</td>
                  <td className="px-5 py-4">
                    <EstadoPropuestaBadge estado={e} vista={!!p.vistaEl} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 tabular-nums text-dark-text/60">{formatFecha(p.fecha)}</td>
                  <td className="whitespace-nowrap px-5 py-4 tabular-nums text-dark-text/60">{formatFecha(p.fechaVencimiento)}</td>
                  <td className="px-3 py-4" data-sin-navegar>
                    <RowActions verHref={`/propuestas/${p.id}`} editarHref={`/propuestas/${p.id}/editar`} />
                  </td>
                </FilaTabla>
              ))
            )}
          </tbody>
        </table>
      </ContenedorTabla>
    </div>
  )
}
