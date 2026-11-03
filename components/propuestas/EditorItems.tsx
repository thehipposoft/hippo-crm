'use client'

import { CLASES_CONTROL } from '@/components/ui/Formulario'
import { formatMonto } from '@/lib/format'
import { ITEM_VACIO, subtotalItem, totalesPropuesta } from '@/lib/propuestas'
import type { ItemPropuesta, Moneda } from '@/lib/types'
import { BotonIcono, ICONOS } from './BotonIcono'

interface EditorItemsProps {
  items: ItemPropuesta[]
  onChange: (items: ItemPropuesta[]) => void
  // Sin moneda (plantillas) no se muestran totales
  moneda?: Moneda
  descuento?: number
}

// Lista editable de ítems. El form la manda como JSON en un input hidden.
export const EditorItems = ({ items, onChange, moneda, descuento = 0 }: EditorItemsProps) => {
  const cambiar = (i: number, cambios: Partial<ItemPropuesta>) =>
    onChange(items.map((item, j) => (j === i ? { ...item, ...cambios } : item)))
  const mover = (i: number, delta: number) => {
    const destino = i + delta
    if (destino < 0 || destino >= items.length) return
    const copia = [...items]
    ;[copia[i], copia[destino]] = [copia[destino], copia[i]]
    onChange(copia)
  }
  const totales = totalesPropuesta(items, descuento)

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <div className="flex items-start gap-2">
            <span className="mt-2.5 w-5 shrink-0 text-xs font-medium tabular-nums text-dark-text/40">{i + 1}</span>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem]">
                <input
                  aria-label={`Descripción del ítem ${i + 1}`}
                  value={item.descripcion}
                  onChange={(e) => cambiar(i, { descripcion: e.target.value })}
                  placeholder="Descripción (ej. Diseño del sitio)"
                  className={CLASES_CONTROL}
                />
                <input
                  aria-label={`Plazo del ítem ${i + 1}`}
                  value={item.plazo ?? ''}
                  onChange={(e) => cambiar(i, { plazo: e.target.value || null })}
                  placeholder="Plazo"
                  className={CLASES_CONTROL}
                />
              </div>
              <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-2">
                <input
                  aria-label={`Cantidad del ítem ${i + 1}`}
                  type="number"
                  min="0"
                  step="any"
                  value={Number.isFinite(item.cantidad) ? item.cantidad : ''}
                  onChange={(e) => cambiar(i, { cantidad: e.target.value === '' ? Number.NaN : Number(e.target.value) })}
                  className={CLASES_CONTROL}
                />
                <input
                  aria-label={`Precio del ítem ${i + 1}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={Number.isFinite(item.precio) ? item.precio : ''}
                  onChange={(e) => cambiar(i, { precio: e.target.value === '' ? Number.NaN : Number(e.target.value) })}
                  placeholder="Precio unitario"
                  className={CLASES_CONTROL}
                />
                <span className="min-w-24 text-right text-sm font-medium tabular-nums text-dark-text">
                  {moneda && Number.isFinite(item.cantidad) && Number.isFinite(item.precio) ? formatMonto(subtotalItem(item), moneda) : ''}
                </span>
              </div>
              <textarea
                aria-label={`Detalle del ítem ${i + 1}`}
                value={item.detalle ?? ''}
                onChange={(e) => cambiar(i, { detalle: e.target.value || null })}
                rows={1}
                placeholder="Detalle opcional (qué incluye)"
                className={`${CLASES_CONTROL} resize-y text-xs`}
              />
            </div>
            <div className="flex shrink-0 flex-col gap-0.5">
              <BotonIcono label="Subir" icono={ICONOS.subir} onClick={() => mover(i, -1)} disabled={i === 0} />
              <BotonIcono label="Bajar" icono={ICONOS.bajar} onClick={() => mover(i, 1)} disabled={i === items.length - 1} />
              <BotonIcono label="Quitar" icono={ICONOS.quitar} onClick={() => onChange(items.filter((_, j) => j !== i))} peligro />
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onChange([...items, { ...ITEM_VACIO }])}
          className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-dark-text/60 transition-colors hover:border-brand-blue hover:text-dark-text"
        >
          + Agregar ítem
        </button>
        {moneda && (
          <div className="text-right text-sm">
            {totales.descuento > 0 && (
              <p className="text-dark-text/50">
                Subtotal {formatMonto(totales.subtotal, moneda)} · descuento −{formatMonto(totales.descuento, moneda)}
              </p>
            )}
            <p className="font-semibold text-dark-text">
              Total <span className="tabular-nums">{formatMonto(totales.total, moneda)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
