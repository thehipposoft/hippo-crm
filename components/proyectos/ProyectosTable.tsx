'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProyectoRow, Estado } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { ProyectoRowActions } from './ProyectoRowActions'

const FILTROS: { label: string; value: Estado | 'TODOS' }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Prospecto', value: 'PROSPECTO' },
  { label: 'En negociación', value: 'EN_NEGOCIACION' },
  { label: 'Activo', value: 'ACTIVO' },
  { label: 'En pausa', value: 'EN_PAUSA' },
  { label: 'Cerrado', value: 'CERRADO' },
  { label: 'Perdido', value: 'PERDIDO' },
]

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface ProyectosTableProps {
  proyectos: ProyectoRow[]
  mostrarCliente?: boolean
}

export const ProyectosTable = ({ proyectos, mostrarCliente = true }: ProyectosTableProps) => {
  const router = useRouter()
  const [filtro, setFiltro] = useState<Estado | 'TODOS'>('TODOS')

  const filtered =
    filtro === 'TODOS' ? proyectos : proyectos.filter((p) => p.estado === filtro)

  const columnCount = mostrarCliente ? 5 : 4

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
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
                Fecha de inicio
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
              filtered.map((proyecto) => (
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
                    {formatDate(proyecto.fechaInicio)}
                  </td>
                  <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                    <ProyectoRowActions proyectoId={proyecto.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
