import { costosDelMes, costoVigenteEn } from './costos'
import { hoy, mismoMes, parseFecha, sumarMeses } from './fechas'
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

// Re-exportado: la lógica de costos vive en lib/costos.ts
export { costoVigenteEn }

// Costos del mes por moneda: lo pagado del período y, si falta algo, el estimado
export function costosEsteMes(costos: CostoRow[]): Record<Moneda, number> {
  const aportes = costosDelMes(costos, hoy()).flatMap((c) => [
    { monto: c.monto, moneda: c.moneda },
    ...(Object.entries(c.otrasMonedas) as [Moneda, number][]).map(([moneda, monto]) => ({ monto, moneda })),
  ])
  return agruparPorMoneda(aportes)
}

export function gastosDelMes(costos: CostoRow[]): Array<{ nombre: string } & Record<Moneda, number>> {
  return costosDelMes(costos, hoy())
    .map((c) => ({
      nombre: c.costo.nombreCosto,
      ...agruparPorMoneda([
        { monto: c.monto, moneda: c.moneda },
        ...(Object.entries(c.otrasMonedas) as [Moneda, number][]).map(([moneda, monto]) => ({ monto, moneda })),
      ]),
    }))
    .sort((a, b) => {
      const totalA = MONEDAS.reduce((sum, m) => sum + a[m], 0)
      const totalB = MONEDAS.reduce((sum, m) => sum + b[m], 0)
      return totalB - totalA
    })
}

// Pagado y pendiente del mes (para "Costos del mes")
export function costosEsteMesDetalle(costos: CostoRow[]): { pagado: Record<Moneda, number>; falta: Record<Moneda, number> } {
  const delMes = costosDelMes(costos, hoy())
  return {
    pagado: agruparPorMoneda(
      delMes.flatMap((c) => [
        { monto: c.pagado, moneda: c.moneda },
        ...(Object.entries(c.otrasMonedas) as [Moneda, number][]).map(([moneda, monto]) => ({ monto, moneda })),
      ])
    ),
    falta: agruparPorMoneda(delMes.map((c) => ({ monto: c.falta, moneda: c.moneda }))),
  }
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
