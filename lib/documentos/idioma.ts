import { aUtc, parseFecha, type FechaCalendario } from '@/lib/fechas'
import { MONEDA_POR_DEFECTO } from '@/lib/types'

export const IDIOMAS = ['es', 'en'] as const
export type Idioma = (typeof IDIOMAS)[number]

const LOCALE: Record<Idioma, string> = { es: 'es-AR', en: 'en-US' }

const PAISES_EN_ESPANOL =
  /argentin|urugua|chile|parag|bolivi|per[uú]|ecuador|colombi|venezuel|m[eé]xic|espa[nñ]|spain|guatemal|hondur|salvador|nicaragu|costa rica|panam|cuba|dominican|puerto rico/i

export const esIdioma = (valor: unknown): valor is Idioma => IDIOMAS.includes(valor as Idioma)

// Idioma del documento: el pedido en la URL, o según el país del cliente (sin país: español)
export const idiomaPara = (pais: string | null | undefined, pedido?: unknown): Idioma => {
  if (esIdioma(pedido)) return pedido
  if (!pais?.trim()) return 'es'
  return PAISES_EN_ESPANOL.test(pais) ? 'es' : 'en'
}

// En documentos el monto va con el código ("USD 1.500,00"): sin ambigüedad entre US$ y A$
export const montoDoc = (monto: number, moneda: string | null | undefined, idioma: Idioma): string =>
  new Intl.NumberFormat(LOCALE[idioma], {
    style: 'currency',
    currency: moneda || MONEDA_POR_DEFECTO,
    currencyDisplay: 'code',
  }).format(monto)

export const fechaDoc = (valor: string | FechaCalendario | null | undefined, idioma: Idioma): string => {
  const fecha = typeof valor === 'object' && valor !== null ? valor : parseFecha(valor)
  if (!fecha) return '—'
  return aUtc(fecha).toLocaleDateString(LOCALE[idioma], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// "R-000123": el número del recibo es el ID del pago en WordPress
const DIGITOS_RECIBO = 6
export const numeroRecibo = (pagoId: number): string => `R-${String(pagoId).padStart(DIGITOS_RECIBO, '0')}`

export const TEXTOS = {
  es: {
    recibo: 'Recibo',
    reciboNumero: 'Recibo N.º',
    fecha: 'Fecha',
    recibimosDe: 'Recibimos de',
    concepto: 'Concepto',
    medioDePago: 'Medio de pago',
    importe: 'Importe',
    total: 'Total recibido',
    pagoDe: 'Pago',
    noFactura: 'Comprobante de pago. No válido como factura.',
    gracias: '¡Gracias!',
    estadoDeCuenta: 'Estado de cuenta',
    emitido: 'Emitido el',
    cliente: 'Cliente',
    resumen: 'Resumen',
    totalALaFecha: 'Total a la fecha',
    pagado: 'Pagado',
    saldo: 'Saldo',
    aFavor: 'a favor',
    alDia: 'Al día',
    proyectos: 'Proyectos',
    proyecto: 'Proyecto',
    tipo: 'Tipo',
    pagoUnico: 'Pago único',
    movimientos: 'Pagos recibidos',
    sinMovimientos: 'Todavía no hay pagos registrados.',
    sinProyectos: 'No hay proyectos facturables.',
    proximosVencimientos: 'Próximos vencimientos',
    vence: 'Vence',
    cuota: 'Cuota',
    otrasMonedas: 'Pagos en otra moneda (no descontados del saldo)',
    verRecibo: 'Ver recibo',
    descargarPdf: 'Descargar PDF',
    volver: 'Volver',
    frecuencia: { SEMANAL: 'Semanal', MENSUAL: 'Mensual', ANUAL: 'Anual' },
    porPeriodo: { SEMANAL: '/ semana', MENSUAL: '/ mes', ANUAL: '/ año' },
    consultas: 'Consultas',
    identificacion: 'ID fiscal',
    mes: 'Mes',
    activas: 'Activas',
    detalleDe: 'Detalle de',
    activasEsteMes: 'Activas este mes',
  },
  en: {
    recibo: 'Receipt',
    reciboNumero: 'Receipt No.',
    fecha: 'Date',
    recibimosDe: 'Received from',
    concepto: 'Description',
    medioDePago: 'Payment method',
    importe: 'Amount',
    total: 'Total received',
    pagoDe: 'Payment',
    noFactura: 'Payment receipt. Not a tax invoice.',
    gracias: 'Thank you!',
    estadoDeCuenta: 'Statement of account',
    emitido: 'Issued on',
    cliente: 'Client',
    resumen: 'Summary',
    totalALaFecha: 'Total to date',
    pagado: 'Paid',
    saldo: 'Balance',
    aFavor: 'in credit',
    alDia: 'Paid up',
    proyectos: 'Projects',
    proyecto: 'Project',
    tipo: 'Type',
    pagoUnico: 'One-off',
    movimientos: 'Payments received',
    sinMovimientos: 'No payments recorded yet.',
    sinProyectos: 'No billable projects.',
    proximosVencimientos: 'Upcoming payments',
    vence: 'Due',
    cuota: 'Instalment',
    otrasMonedas: 'Payments in another currency (not deducted from the balance)',
    verRecibo: 'View receipt',
    descargarPdf: 'Download PDF',
    volver: 'Back',
    frecuencia: { SEMANAL: 'Weekly', MENSUAL: 'Monthly', ANUAL: 'Yearly' },
    porPeriodo: { SEMANAL: '/ week', MENSUAL: '/ month', ANUAL: '/ year' },
    consultas: 'Questions',
    identificacion: 'Tax ID',
    mes: 'Month',
    activas: 'Active',
    detalleDe: 'Monthly detail —',
    activasEsteMes: 'Active this month',
  },
} as const satisfies Record<Idioma, unknown>

// Medios de pago se guardan en español; en inglés se traducen
const MEDIOS_EN: Record<string, string> = {
  Transferencia: 'Bank transfer',
  Efectivo: 'Cash',
  Tarjeta: 'Card',
  Cheque: 'Cheque',
  Otro: 'Other',
}

export const medioDoc = (medio: string | null | undefined, idioma: Idioma): string => {
  if (!medio) return '—'
  return idioma === 'en' ? (MEDIOS_EN[medio] ?? medio) : medio
}

// Nombre de la unidad (se guarda en español) en el idioma del documento
const UNIDADES_EN: Record<string, string> = {
  casilla: 'mailbox',
  licencia: 'license',
  usuario: 'user',
  dominio: 'domain',
  sitio: 'site',
}

export const unidadDoc = (unidad: string, idioma: Idioma, plural = false): string => {
  const nombre = idioma === 'en' ? (UNIDADES_EN[unidad] ?? unidad) : unidad
  return plural ? `${nombre}${idioma === 'en' && nombre.endsWith('x') ? 'es' : 's'}` : nombre
}

// Fecha de mes: "Octubre de 2026" / "October 2026" (solo la primera letra en mayúscula)
export const mesDoc = (fecha: FechaCalendario, idioma: Idioma): string => {
  const texto = aUtc(fecha).toLocaleDateString(LOCALE[idioma], { month: 'long', year: 'numeric', timeZone: 'UTC' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
