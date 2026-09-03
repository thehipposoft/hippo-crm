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
  if (!fechaIso) return false
  const fecha = new Date(fechaIso)
  const ahora = new Date()
  return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth()
}

export function pagosEsteMes(pagos: PagoRow[]): Record<Moneda, number> {
  return agruparPorMoneda(pagos.filter((p) => esEsteMes(p.fecha)))
}

const MESES_POR_ANIO = 12

// Costo mensualizado: mensual/semanal aportan su monto completo cada mes; uno
// anual se prorratea (monto / 12) para reflejar su impacto mensual promedio.
function costoMensualizado(costo: CostoRow): number {
  if (costo.frecuencia === 'ANUAL') return costo.monto / MESES_POR_ANIO
  return costo.monto
}

export function costosEsteMes(costos: CostoRow[]): Record<Moneda, number> {
  const aportes = costos.map((c) => ({ monto: costoMensualizado(c), moneda: c.moneda }))
  return agruparPorMoneda(aportes)
}

export function gastosDelMes(costos: CostoRow[]): Array<{ nombre: string } & Record<Moneda, number>> {
  return costos
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

const formatMesLabel = (fecha: Date): string =>
  fecha.toLocaleDateString('es-UY', { month: 'short', year: 'numeric' })

export function pagosPorMes(pagos: PagoRow[]): Array<{ mes: string } & Record<Moneda, number>> {
  const ahora = new Date()
  const meses: Date[] = Array.from({ length: 12 }, (_, i) =>
    new Date(ahora.getFullYear(), ahora.getMonth() - (11 - i), 1)
  )

  return meses.map((fecha) => {
    const pagosDelMes = pagos.filter((p) => {
      if (!p.fecha) return false
      const fechaPago = new Date(p.fecha)
      return fechaPago.getFullYear() === fecha.getFullYear() && fechaPago.getMonth() === fecha.getMonth()
    })
    return { mes: formatMesLabel(fecha), ...agruparPorMoneda(pagosDelMes) }
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
