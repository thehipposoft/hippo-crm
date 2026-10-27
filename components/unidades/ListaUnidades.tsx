'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { darDeBajaUnidad, eliminarUnidad } from '@/app/(crm)/proyectos/[id]/unidades/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatFecha } from '@/lib/format'
import type { UnidadRow } from '@/lib/types'

type Filtro = 'ACTIVAS' | 'TODAS'

interface ListaUnidadesProps {
  proyectoId: number
  unidades: UnidadRow[]
  etiqueta: string
  // 'YYYY-MM-DD' de hoy (viene del server para no depender del reloj del navegador)
  hoyIso: string
}

const estaActiva = (u: UnidadRow, hoyIso: string): boolean => !u.fechaBaja || u.fechaBaja.slice(0, 10) >= hoyIso

export const ListaUnidades = ({ proyectoId, unidades, etiqueta, hoyIso }: ListaUnidadesProps) => {
  const [filtro, setFiltro] = useState<Filtro>('ACTIVAS')
  const [bajaDe, setBajaDe] = useState<UnidadRow | null>(null)
  const [fechaBaja, setFechaBaja] = useState(hoyIso)
  const [eliminarDe, setEliminarDe] = useState<UnidadRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const visibles = unidades.filter((u) => filtro === 'TODAS' || estaActiva(u, hoyIso))

  const ejecutar = (accion: () => Promise<{ error: string | null }>, cerrar: () => void) => {
    setError(null)
    startTransition(async () => {
      const resultado = await accion()
      if (resultado.error) setError(resultado.error)
      else cerrar()
    })
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(['ACTIVAS', 'TODAS'] as const).map((opcion) => (
          <button
            key={opcion}
            type="button"
            onClick={() => setFiltro(opcion)}
            aria-pressed={filtro === opcion}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filtro === opcion ? 'bg-brand-blue text-white' : 'border border-slate-200 bg-white text-dark-text/60 hover:bg-brand-blue/10'
            }`}
          >
            {opcion === 'ACTIVAS' ? 'Activas' : `Todas (${unidades.length})`}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-dark-text/40">
          {unidades.length === 0 ? `Todavía no hay ${etiqueta}s cargadas.` : `No hay ${etiqueta}s activas.`}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {visibles.map((u) => {
            const activa = estaActiva(u, hoyIso)
            return (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <div className="min-w-0">
                  <p className={`break-all text-sm font-medium ${activa ? 'text-dark-text' : 'text-dark-text/40 line-through'}`}>
                    {u.nombre}
                  </p>
                  <p className="text-xs text-dark-text/50">
                    Alta {formatFecha(u.fechaAlta)}
                    {u.fechaBaja && <> · Baja {formatFecha(u.fechaBaja)}</>}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {!u.fechaBaja && (
                    <button
                      type="button"
                      onClick={() => {
                        setFechaBaja(hoyIso)
                        setBajaDe(u)
                      }}
                      className="rounded-md px-2 py-1 font-medium text-orange-700 hover:bg-orange-50"
                    >
                      Dar de baja
                    </button>
                  )}
                  <Link
                    href={`/proyectos/${proyectoId}/unidades/${u.id}/editar`}
                    className="rounded-md px-2 py-1 font-medium text-dark-text/60 hover:bg-slate-100 hover:text-dark-text"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEliminarDe(u)}
                    aria-label={`Eliminar ${u.nombre}`}
                    className="rounded-md px-2 py-1 font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {bajaDe && (
        <div role="dialog" aria-label={`Dar de baja ${bajaDe.nombre}`} className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm text-dark-text">
            Dar de baja <span className="font-medium">{bajaDe.nombre}</span>
          </p>
          <p className="text-xs text-dark-text/60">El mes de la baja se cobra completo.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={fechaBaja}
              min={bajaDe.fechaAlta?.slice(0, 10)}
              onChange={(e) => setFechaBaja(e.target.value)}
              aria-label="Fecha de baja"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              disabled={pending || !fechaBaja}
              onClick={() => ejecutar(() => darDeBajaUnidad(proyectoId, bajaDe.id, fechaBaja), () => setBajaDe(null))}
              className="rounded-lg bg-orange-600 px-3.5 py-1.5 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
            >
              {pending ? 'Guardando...' : 'Confirmar baja'}
            </button>
            <button type="button" onClick={() => setBajaDe(null)} className="px-2 text-sm text-dark-text/60 hover:text-dark-text">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && !eliminarDe && (
        <p role="alert" className="mt-2 text-xs text-rose-600">
          {error}
        </p>
      )}

      <ConfirmDialog
        abierto={eliminarDe !== null}
        titulo={`¿Eliminar ${eliminarDe?.nombre ?? ''}?`}
        mensaje={`Se borra del historial y deja de contar en todos los meses. Si solo dejó de usarse, mejor usá "Dar de baja".`}
        textoConfirmar="Eliminar"
        pending={pending}
        error={error}
        onConfirmar={() => eliminarDe && ejecutar(() => eliminarUnidad(proyectoId, eliminarDe.id), () => setEliminarDe(null))}
        onCancelar={() => setEliminarDe(null)}
      />
    </div>
  )
}
