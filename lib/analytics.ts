import { hoy, indiceMes, MESES_POR_ANIO, mismoMes, parseFecha, sumarMeses, type FechaCalendario } from './fechas'
import { formatMes } from './format'
import { ESTADOS, MONEDAS, type CostoRow, type Estado, type Moneda, type PagoRow, type ProyectoRow } from './types'

const MONEDAS_VALIDAS = MONEDAS as readonly string[]

const registroVacio = (): Record<Moneda, number> =>
  Object.fromEntries(MONEDAS.map((m) => [m, 0])) as Record<Moneda, number>

export function agruparPorMoneda(items: { monto: number; moneda: string }[]): Record<Moneda, number> {
  const resultado = registroVacio()
  for (const item of items) {
    if (MONEDAS_VALIDAS.includes(item.moneda)) {
      resultado[item.moneda as Moneda] += item.monto
    }
  }
  return resultado
}

export function esEsteMes(fechaIso: string | null | undefined): boolean {
  const fecha = parseFecha(fechaIso)
  return fecha !== null && mismoMes(fecha, hoy())
}

export function pagosEsteMes(pagos: PagoRow[]): Record<Moneda, number> {
  return agruparPorMoneda(pagos.filter((p) => esEsteMes(p.fecha)))
}

const SEMANAS_POR_ANIO = 52

// Costo mensualizado: mensual aporta su monto; semanal, 52 semanas / 12 meses
// (~4,33 por mes); anual se prorratea (monto / 12).
function costoMensualizado(costo: CostoRow): number {
  switch (costo.frecuencia) {
    case 'SEMANAL':
      return (costo.monto * SEMANAS_POR_ANIO) / MESES_POR_ANIO
    case 'ANUAL':
      return costo.monto / MESES_POR_ANIO
    default:
      return costo.monto
  }
}

// Un costo cuenta en el mes si se dio de alta antes de que termine y no se dio
// de baja antes de que empiece (el mes de la baja todavía se paga).
export function costoVigenteEn(costo: CostoRow, mes: FechaCalendario = hoy()): boolean {
  const alta = parseFecha(costo.fechaInicio)
  const baja = parseFecha(costo.fechaBaja)
  const indice = indiceMes(mes)
  if (alta && indiceMes(alta) > indice) return false
  if (baja && indiceMes(baja) < indice) return false
  return true
}

const costosVigentesEsteMes = (costos: CostoRow[]): CostoRow[] => {
  const mes = hoy()
  return costos.filter((c) => costoVigenteEn(c, mes))
}

export function costosEsteMes(costos: CostoRow[]): Record<Moneda, number> {
  const aportes = costosVigentesEsteMes(costos).map((c) => ({ monto: costoMensualizado(c), moneda: c.moneda }))
  return agruparPorMoneda(aportes)
}

export function gastosDelMes(costos: CostoRow[]): Array<{ nombre: string } & Record<Moneda, number>> {
  return costosVigentesEsteMes(costos)
    .map((c) => ({
      nombre: c.nombreCosto,
      ...agruparPorMoneda([{ monto: costoMensualizado(c), moneda: c.moneda }]),
    }))
    .sort((a, b) => {
      const totalA = MONEDAS.reduce((sum, m) => sum + a[m], 0)
      const totalB = MONEDAS.reduce((sum, m) => sum + b[m], 0)
      return totalB - totalA
    })
}

export function resultadoParcial(pagos: PagoRow[], costos: CostoRow[]): Partial<Record<Moneda, number>> {
  const pagosMes = pagosEsteMes(pagos)
  const costosMes = costosEsteMes(costos)
  const resultado: Partial<Record<Moneda, number>> = {}

  for (const moneda of MONEDAS) {
    if (pagosMes[moneda] !== 0 || costosMes[moneda] !== 0) {
      resultado[moneda] = pagosMes[moneda] - costosMes[moneda]
    }
  }

  return resultado
}

export function totalHistoricoPagos(pagos: PagoRow[]): Record<Moneda, number> {
  return agruparPorMoneda(pagos)
}

const MESES_GRAFICO = 12

export function pagosPorMes(pagos: PagoRow[]): Array<{ mes: string } & Record<Moneda, number>> {
  const inicioMesActual = { ...hoy(), dia: 1 }
  const meses = Array.from({ length: MESES_GRAFICO }, (_, i) =>
    sumarMeses(inicioMesActual, i - (MESES_GRAFICO - 1))
  )

  return meses.map((mes) => {
    const pagosDelMes = pagos.filter((p) => {
      const fechaPago = parseFecha(p.fecha)
      return fechaPago !== null && mismoMes(fechaPago, mes)
    })
    return { mes: formatMes(mes), ...agruparPorMoneda(pagosDelMes) }
  })
}

export function pagosPorCliente(pagos: PagoRow[]): Array<{ cliente: string } & Record<Moneda, number>> {
  const porCliente = new Map<string, PagoRow[]>()

  for (const pago of pagos) {
    const cliente = pago.clienteNombre?.trim() || 'Sin cliente'
    const grupo = porCliente.get(cliente) ?? []
    grupo.push(pago)
    porCliente.set(cliente, grupo)
  }

  return Array.from(porCliente.entries())
    .map(([cliente, pagosCliente]) => ({ cliente, ...agruparPorMoneda(pagosCliente) }))
    .sort((a, b) => {
      const totalA = MONEDAS.reduce((sum, m) => sum + a[m], 0)
      const totalB = MONEDAS.reduce((sum, m) => sum + b[m], 0)
      return totalB - totalA
    })
}

export function proyectosPorEstado(proyectos: ProyectoRow[]): Array<{ estado: Estado; cantidad: number }> {
  return ESTADOS.map(({ value }) => ({
    estado: value,
    cantidad: proyectos.filter((p) => p.estado === value).length,
  }))
}
