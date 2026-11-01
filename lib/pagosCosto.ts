import { etiquetaPeriodo, montoEsperado, opcionesDePeriodo, resumenPeriodo, type EstadoPeriodo } from './costos'
import type { FechaCalendario } from './fechas'
import type { CostoRow } from './types'

const ETIQUETA_ESTADO: Record<EstadoPeriodo, string> = {
  PAGADO: 'pagado',
  PARCIAL: 'parcial',
  PENDIENTE: 'pendiente',
}

const CENTAVOS = 100

// Opciones del selector de período del form de pago de un costo.
// `excluirPagoId`: al editar, el pago no cuenta para el estado de su propio período.
// `incluir`: un período que tiene que estar aunque quede fuera del historial (el del pago editado).
export const opcionesFormPagoCosto = (
  costo: CostoRow,
  fechaHoy: FechaCalendario,
  { excluirPagoId, incluir }: { excluirPagoId?: number; incluir?: string } = {}
) => {
  const base = excluirPagoId ? { ...costo, pagos: (costo.pagos ?? []).filter((p) => p.id !== excluirPagoId) } : costo
  const periodos = opcionesDePeriodo(base, fechaHoy)
  if (incluir && !periodos.includes(incluir)) periodos.push(incluir)
  return periodos.map((periodo) => {
    const r = resumenPeriodo(base, periodo)
    const montoSugerido = Math.round((r.estado === 'PAGADO' ? montoEsperado(base) : r.falta) * CENTAVOS) / CENTAVOS
    return { periodo, label: `${etiquetaPeriodo(periodo)} · ${ETIQUETA_ESTADO[r.estado]}`, montoSugerido }
  })
}
