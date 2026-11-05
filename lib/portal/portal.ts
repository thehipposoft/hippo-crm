import { estaVencida, totalesPropuesta } from '@/lib/propuestas'
import type { FechaCalendario } from '@/lib/fechas'
import type { EstadoDeCuenta } from '@/lib/documentos/estadoDeCuenta'
import type { Moneda, PropuestaPortal } from '@/lib/types'

// Lógica del portal de clientes (sin dependencias de Next: se testea con Vitest)

export const MIN_CLAVE = 8

export type ProximoPago = { proyectoId: number; proyecto: string; fecha: FechaCalendario; monto: number; moneda: Moneda }

// Próxima cuota de cada recurrente. Por unidad: activas este mes × precio.
export const proximosPagos = (estado: Pick<EstadoDeCuenta, 'proximos'>): ProximoPago[] =>
  estado.proximos
    .map(({ proyecto, resumen, proximoVencimiento, unidadesEsteMes }) => ({
      proyectoId: proyecto.id,
      proyecto: proyecto.nombre,
      fecha: proximoVencimiento,
      monto: unidadesEsteMes !== null ? unidadesEsteMes * proyecto.valor : proyecto.valor,
      moneda: resumen.moneda,
    }))
    .sort((a, b) => a.fecha.anio - b.fecha.anio || a.fecha.mes - b.fecha.mes || a.fecha.dia - b.fecha.dia)

export type GrupoPropuestas = {
  // Esperando respuesta y vigentes: lo primero que ve el cliente
  pendientes: (PropuestaPortal & { total: number })[]
  resto: (PropuestaPortal & { total: number; vencida: boolean })[]
}

export const agruparPropuestas = (propuestas: PropuestaPortal[], fechaHoy: FechaCalendario): GrupoPropuestas => {
  const conTotal = propuestas
    .map((p) => ({ ...p, total: totalesPropuesta(p.items, p.descuento).total, vencida: p.vencida || estaVencida(p, fechaHoy) }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
  return {
    pendientes: conTotal.filter((p) => p.estado === 'ENVIADA' && !p.vencida),
    resto: conTotal.filter((p) => !(p.estado === 'ENVIADA' && !p.vencida)),
  }
}
