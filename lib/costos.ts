import { aUtc, hoy, indiceMes, MESES_POR_ANIO, parseFecha, sumarMeses, type FechaCalendario } from './fechas'
import { CATEGORIAS_COSTO, type CategoriaCosto, type CostoRow, type Moneda, type PagoCostoRow } from './types'

// Períodos de un costo: 'YYYY-MM' para mensuales y semanales, 'YYYY' para anuales.
// Un pago cubre un período (puede pagarse antes o después de que empiece).

const SEMANAS_POR_ANIO = 52
const TOLERANCIA_REDONDEO = 0.005
const CENTAVOS = 100
export const PERIODOS_HISTORIAL = 12

const PATRON_PERIODO = /^(\d{4})(?:-(0[1-9]|1[0-2]))?$/

export const labelCategoria = (categoria: CategoriaCosto | null | undefined): string | null =>
  CATEGORIAS_COSTO.find((c) => c.value === categoria)?.label ?? null

export const esAnual = (costo: Pick<CostoRow, 'frecuencia'>): boolean => costo.frecuencia === 'ANUAL'

export const esPeriodoValido = (periodo: string): boolean => PATRON_PERIODO.test(periodo)

export const periodoDeFecha = (costo: Pick<CostoRow, 'frecuencia'>, fecha: FechaCalendario): string =>
  esAnual(costo) ? String(fecha.anio) : `${fecha.anio}-${String(fecha.mes + 1).padStart(2, '0')}`

// Primer día del período
export const inicioDePeriodo = (periodo: string): FechaCalendario | null => {
  const match = PATRON_PERIODO.exec(periodo)
  if (!match) return null
  return { anio: Number(match[1]), mes: match[2] ? Number(match[2]) - 1 : 0, dia: 1 }
}

const siguientePeriodo = (costo: Pick<CostoRow, 'frecuencia'>, periodo: string, pasos = 1): string => {
  const inicio = inicioDePeriodo(periodo) as FechaCalendario
  return esAnual(costo)
    ? String(inicio.anio + pasos)
    : periodoDeFecha(costo, sumarMeses(inicio, pasos))
}

// "Octubre 2026" / "2026"
export const etiquetaPeriodo = (periodo: string): string => {
  const inicio = inicioDePeriodo(periodo)
  if (!inicio) return periodo
  if (!periodo.includes('-')) return periodo
  const texto = aUtc(inicio).toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Lo que se espera pagar por período: semanal → ~4,33 semanas por mes
export const montoEsperado = (costo: Pick<CostoRow, 'frecuencia' | 'monto'>): number =>
  costo.frecuencia === 'SEMANAL' ? (costo.monto * SEMANAS_POR_ANIO) / MESES_POR_ANIO : costo.monto

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

// Vigente en algún momento del período (anuales: algún mes del año)
const vigenteEnPeriodo = (costo: CostoRow, periodo: string): boolean => {
  const inicio = inicioDePeriodo(periodo)
  if (!inicio) return false
  if (!esAnual(costo)) return costoVigenteEn(costo, inicio)
  return Array.from({ length: MESES_POR_ANIO }, (_, i) => sumarMeses(inicio, i)).some((mes) => costoVigenteEn(costo, mes))
}

export const pagosDelPeriodo = (costo: CostoRow, periodo: string): PagoCostoRow[] =>
  (costo.pagos ?? []).filter((p) => p.periodo === periodo)

export type EstadoPeriodo = 'PAGADO' | 'PARCIAL' | 'PENDIENTE'

export type ResumenPeriodo = {
  periodo: string
  estado: EstadoPeriodo
  esperado: number
  // En la moneda del costo
  pagado: number
  falta: number
  pagos: PagoCostoRow[]
  // Pagos en otra moneda: no se comparan con el esperado; si hay, el período cuenta como pagado
  otrasMonedas: Partial<Record<Moneda, number>>
}

export const resumenPeriodo = (costo: CostoRow, periodo: string): ResumenPeriodo => {
  const pagos = pagosDelPeriodo(costo, periodo)
  const esperado = montoEsperado(costo)
  let pagado = 0
  const otrasMonedas: Partial<Record<Moneda, number>> = {}
  for (const p of pagos) {
    if (p.moneda === costo.moneda) pagado += p.monto
    else otrasMonedas[p.moneda] = (otrasMonedas[p.moneda] ?? 0) + p.monto
  }
  const hayOtras = Object.keys(otrasMonedas).length > 0
  const falta = hayOtras ? 0 : Math.max(0, Math.round((esperado - pagado) * CENTAVOS) / CENTAVOS)
  const estado: EstadoPeriodo =
    hayOtras || falta <= TOLERANCIA_REDONDEO ? 'PAGADO' : pagado > TOLERANCIA_REDONDEO ? 'PARCIAL' : 'PENDIENTE'
  return { periodo, estado, esperado, pagado, falta: estado === 'PAGADO' ? 0 : falta, pagos, otrasMonedas }
}

// Desde cuándo se esperan pagos: el primer período con un pago registrado (o el actual si no hay),
// sin ir antes del alta. Así los costos cargados antes de registrar pagos no aparecen con
// un año de "deuda" que en realidad se pagó por fuera del CRM.
const periodoInicial = (costo: CostoRow, actual: string): string => {
  const pagados = (costo.pagos ?? []).map((p) => p.periodo).filter((p): p is string => !!p && esPeriodoValido(p)).sort()
  const desdePagos = pagados[0] && pagados[0] < actual ? pagados[0] : actual
  const alta = parseFecha(costo.fechaInicio)
  const desdeAlta = alta ? periodoDeFecha(costo, alta) : null
  return desdeAlta && desdeAlta > desdePagos ? desdeAlta : desdePagos
}

// Períodos a mostrar, más nuevo primero: desde el inicio hasta el actual (o la baja),
// más los que ya tengan pagos adelantados. Como máximo `limite`.
export const periodosDelCosto = (
  costo: CostoRow,
  fechaHoy: FechaCalendario = hoy(),
  limite = PERIODOS_HISTORIAL
): string[] => {
  const actual = periodoDeFecha(costo, fechaHoy)
  const baja = parseFecha(costo.fechaBaja)
  const ultimo = baja && periodoDeFecha(costo, baja) < actual ? periodoDeFecha(costo, baja) : actual
  const primero = periodoInicial(costo, actual)

  const periodos = new Set<string>()
  for (let p = ultimo, i = 0; p >= primero && i < limite; p = siguientePeriodo(costo, p, -1), i++) {
    if (vigenteEnPeriodo(costo, p)) periodos.add(p)
  }
  for (const pago of costo.pagos ?? []) {
    if (pago.periodo && esPeriodoValido(pago.periodo) && pago.periodo > ultimo) periodos.add(pago.periodo)
  }
  return [...periodos].sort().reverse().slice(0, limite)
}

export const periodosPendientes = (costo: CostoRow, fechaHoy: FechaCalendario = hoy()): ResumenPeriodo[] =>
  periodosDelCosto(costo, fechaHoy)
    .filter((p) => p <= periodoDeFecha(costo, fechaHoy))
    .map((p) => resumenPeriodo(costo, p))
    .filter((r) => r.estado !== 'PAGADO')
    .reverse()

export type SugerenciaPagoCosto = { periodo: string; monto: number; moneda: Moneda; metodoPago: string | null }

// El período pendiente más viejo; si está todo al día, el siguiente al actual
export const sugerenciaPagoCosto = (costo: CostoRow, fechaHoy: FechaCalendario = hoy()): SugerenciaPagoCosto => {
  const pendiente = periodosPendientes(costo, fechaHoy)[0]
  const actual = periodoDeFecha(costo, fechaHoy)
  const periodo = pendiente?.periodo ?? (resumenPeriodo(costo, actual).estado === 'PAGADO' ? siguientePeriodo(costo, actual) : actual)
  const monto = pendiente?.falta ?? Math.round(montoEsperado(costo) * CENTAVOS) / CENTAVOS
  return { periodo, monto, moneda: costo.moneda, metodoPago: costo.metodoPago }
}

// Opciones del selector de período: los del historial más los próximos (para adelantar)
const PERIODOS_FUTUROS = 2

export const opcionesDePeriodo = (costo: CostoRow, fechaHoy: FechaCalendario = hoy()): string[] => {
  const actual = periodoDeFecha(costo, fechaHoy)
  const futuros = Array.from({ length: PERIODOS_FUTUROS }, (_, i) => siguientePeriodo(costo, actual, i + 1))
  return [...new Set([...futuros, actual, ...periodosDelCosto(costo, fechaHoy)])].sort().reverse()
}

// Períodos que ya deberían estar pagos y no lo están (el actual incluido), de todos los costos.
// Más viejo primero.
export type PeriodoPorPagar = { costo: CostoRow; resumen: ResumenPeriodo }

export const costosPorPagar = (costos: CostoRow[], fechaHoy: FechaCalendario = hoy()): PeriodoPorPagar[] =>
  costos
    .flatMap((costo) => periodosPendientes(costo, fechaHoy).map((resumen) => ({ costo, resumen })))
    .sort((a, b) => inicioOrden(a) - inicioOrden(b) || a.costo.nombreCosto.localeCompare(b.costo.nombreCosto))

const inicioOrden = ({ resumen }: PeriodoPorPagar): number => {
  const inicio = inicioDePeriodo(resumen.periodo)
  return inicio ? indiceMes(inicio) : 0
}

export const ultimoPago = (costo: CostoRow): PagoCostoRow | null =>
  [...(costo.pagos ?? [])].sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? '') || b.id - a.id)[0] ?? null

// ==== Costos del mes ====
// Por período: si el período tiene pagos registrados se usa lo pagado; si no, el estimado.
// Anuales: lo del año / 12.

export type CostoDelMes = {
  costo: CostoRow
  // Lo que suma al mes (pagado si hay pagos, si no estimado)
  monto: number
  moneda: Moneda
  pagado: number
  falta: number
  // Pagos en otras monedas del período (anuales: /12)
  otrasMonedas: Partial<Record<Moneda, number>>
  estado: EstadoPeriodo
}

export const costosDelMes = (costos: CostoRow[], mes: FechaCalendario = hoy()): CostoDelMes[] =>
  costos
    .filter((c) => costoVigenteEn(c, mes))
    .map((costo) => {
      const r = resumenPeriodo(costo, periodoDeFecha(costo, mes))
      const divisor = esAnual(costo) ? MESES_POR_ANIO : 1
      const otrasMonedas: Partial<Record<Moneda, number>> = {}
      for (const [moneda, monto] of Object.entries(r.otrasMonedas) as [Moneda, number][]) otrasMonedas[moneda] = monto / divisor
      const pagado = r.pagado / divisor
      const falta = r.falta / divisor
      return { costo, monto: pagado + falta, moneda: costo.moneda, pagado, falta, otrasMonedas, estado: r.estado }
    })
