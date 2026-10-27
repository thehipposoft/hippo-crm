import { agruparPorMoneda, costoVigenteEn } from './analytics'
import { compararFechas, diasEntre, hoy, parseFecha, sumarDias, type FechaCalendario } from './fechas'
import {
  cobroRecurrente,
  inicioPeriodo,
  periodosIniciados,
  resumenPendiente,
  saldoProyecto,
  type CobroRecurrente,
  type ResumenPendiente,
} from './proyectos'
import type { CostoRow, Estado, Moneda, PagoRow, ProyectoRow } from './types'

export const DIAS_AVISO_DEADLINE = 14
export const DIAS_AVISO_RENOVACION = 30

// Proyectos vivos: tienen deadlines y acciones por hacer
const ESTADOS_ABIERTOS: readonly Estado[] = ['PROSPECTO', 'EN_NEGOCIACION', 'ACTIVO', 'EN_PAUSA']
// Estados donde el saldo es plata que nos deben (no un presupuesto)
export const ESTADOS_CON_DEUDA: readonly Estado[] = ['ACTIVO', 'EN_PAUSA', 'CERRADO']

const estaAbierto = (p: ProyectoRow): boolean => ESTADOS_ABIERTOS.includes(p.estado)

export type ItemConFecha<T> = {
  item: T
  fecha: FechaCalendario
  // Días desde hoy: negativo = ya pasó
  dias: number
}

// Deadlines vencidos o dentro de los próximos días, más urgentes primero
export const deadlinesProximos = (
  proyectos: ProyectoRow[],
  fechaHoy: FechaCalendario = hoy()
): ItemConFecha<ProyectoRow>[] =>
  proyectos
    .filter(estaAbierto)
    .flatMap((p) => {
      const fecha = parseFecha(p.deadline)
      if (!fecha) return []
      const dias = diasEntre(fechaHoy, fecha)
      return dias <= DIAS_AVISO_DEADLINE ? [{ item: p, fecha, dias }] : []
    })
    .sort((a, b) => a.dias - b.dias)

// Próxima renovación: la fecha cargada, corrida según la frecuencia hasta hoy o después
const proximaRenovacion = (costo: CostoRow, fechaHoy: FechaCalendario): FechaCalendario | null => {
  const base = parseFecha(costo.fechaRenovacion)
  if (!base) return null
  const yaPasaron = periodosIniciados(costo.frecuencia, base, sumarDias(fechaHoy, -1))
  return inicioPeriodo(base, costo.frecuencia, yaPasaron)
}

export const renovacionesProximas = (
  costos: CostoRow[],
  fechaHoy: FechaCalendario = hoy()
): ItemConFecha<CostoRow>[] =>
  costos
    .filter((c) => costoVigenteEn(c, fechaHoy))
    .flatMap((c) => {
      const fecha = proximaRenovacion(c, fechaHoy)
      if (!fecha) return []
      const baja = parseFecha(c.fechaBaja)
      if (baja && compararFechas(fecha, baja) > 0) return []
      const dias = diasEntre(fechaHoy, fecha)
      return dias <= DIAS_AVISO_RENOVACION ? [{ item: c, fecha, dias }] : []
    })
    .sort((a, b) => a.dias - b.dias)

export const accionesPendientes = (proyectos: ProyectoRow[]): ProyectoRow[] =>
  proyectos.filter((p) => estaAbierto(p) && Boolean(p.accionPendiente?.trim()))

export type Deuda = { proyecto: ProyectoRow; resumen: ResumenPendiente; monto: number }

export type PorCobrar = {
  totales: Partial<Record<Moneda, number>>
  deudas: Deuda[]
}

export const porCobrar = (proyectos: ProyectoRow[], pagos: PagoRow[], fechaHoy: FechaCalendario = hoy()): PorCobrar => {
  const deudas = proyectos
    .filter((p) => ESTADOS_CON_DEUDA.includes(p.estado))
    .flatMap((proyecto) => {
      const resumen = resumenPendiente(proyecto, pagos, fechaHoy)
      const saldo = saldoProyecto(resumen)
      return saldo.tipo === 'PENDIENTE' ? [{ proyecto, resumen, monto: saldo.monto }] : []
    })
    .sort((a, b) => b.monto - a.monto)

  const porMoneda = agruparPorMoneda(deudas.map((d) => ({ monto: d.monto, moneda: d.resumen.moneda })))
  const totales: Partial<Record<Moneda, number>> = {}
  for (const [moneda, monto] of Object.entries(porMoneda) as [Moneda, number][]) {
    if (monto > 0) totales[moneda] = monto
  }
  return { totales, deudas }
}

// Recurrentes activos, ordenados por próximo vencimiento
export const recurrentesDelMes = (
  proyectos: ProyectoRow[],
  pagos: PagoRow[],
  fechaHoy: FechaCalendario = hoy()
): CobroRecurrente[] =>
  proyectos
    .filter((p) => p.estado === 'ACTIVO')
    .flatMap((p) => {
      const cobro = cobroRecurrente(p, pagos, fechaHoy)
      return cobro ? [cobro] : []
    })
    .sort((a, b) => {
      if (!a.proximoVencimiento) return 1
      if (!b.proximoVencimiento) return -1
      return compararFechas(a.proximoVencimiento, b.proximoVencimiento)
    })

export type DatoIncompleto = { proyecto: ProyectoRow; motivo: string }

// Datos que hacen que los números del CRM no cierren
export const datosIncompletos = (proyectos: ProyectoRow[]): DatoIncompleto[] =>
  proyectos
    .filter((p) => p.estado !== 'PERDIDO')
    .flatMap((proyecto) => {
      const motivos: string[] = []
      if (!proyecto.moneda) motivos.push('sin moneda')
      if (proyecto.tipoProyecto === 'RECURRENTE' && !parseFecha(proyecto.fechaInicio)) motivos.push('recurrente sin fecha de inicio')
      if (proyecto.estado === 'ACTIVO' && proyecto.valor <= 0) motivos.push('sin valor')
      return motivos.length > 0 ? [{ proyecto, motivo: motivos.join(', ') }] : []
    })
