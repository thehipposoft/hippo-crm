export type Estado =
  | 'PROSPECTO'
  | 'EN_NEGOCIACION'
  | 'ACTIVO'
  | 'EN_PAUSA'
  | 'CERRADO'
  | 'PERDIDO'

export type ClienteRow = {
  id: number
  nombre: string
  contacto: string | null
  telefono: string | null
  emailContacto: string | null
  pais: string | null
}

export type TipoProyecto = 'ON_OFF' | 'RECURRENTE'

export type FrecuenciaPago = 'SEMANAL' | 'MENSUAL' | 'ANUAL'

export type ProyectoRow = {
  id: number
  nombre: string
  clienteId: number
  clienteNombre: string
  estado: Estado
  fechaInicio: string | null
  deadline: string | null
  accionPendiente: string | null
  tipoProyecto: TipoProyecto
  valor: number
  frecuenciaPago: FrecuenciaPago | null
  url: string | null
  // Pendiente en WordPress: hasta que lo devuelva, se infiere de los pagos
  moneda?: Moneda | null
}

export type Moneda = 'USD' | 'ARS' | 'AUD' | 'EUR'

export type PagoRow = {
  id: number
  proyectoId: number
  proyectoNombre: string | null
  clienteNombre: string | null
  fecha: string | null
  monto: number
  moneda: Moneda
  medioPago: string | null
  notas: string | null
}

export type CostoRow = {
  id: number
  nombreCosto: string
  monto: number
  moneda: Moneda
  metodoPago: string | null
  frecuencia: FrecuenciaPago
  fechaRenovacion: string | null
  // Vigencia: sin alta = desde siempre, sin baja = sigue activo
  fechaInicio?: string | null
  fechaBaja?: string | null
}

export const ESTADOS: { value: Estado; label: string }[] = [
  { value: 'PROSPECTO', label: 'Prospecto' },
  { value: 'EN_NEGOCIACION', label: 'En negociación' },
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'EN_PAUSA', label: 'En pausa' },
  { value: 'CERRADO', label: 'Cerrado' },
  { value: 'PERDIDO', label: 'Perdido' },
]

export const MEDIOS_PAGO = ['Transferencia', 'Efectivo', 'Tarjeta', 'Cheque', 'Otro'] as const

export const TIPOS_PROYECTO: { value: TipoProyecto; label: string }[] = [
  { value: 'ON_OFF', label: 'On-off' },
  { value: 'RECURRENTE', label: 'Recurrente' },
]

export const FRECUENCIAS_PAGO: { value: FrecuenciaPago; label: string }[] = [
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'ANUAL', label: 'Anual' },
]

export const MONEDAS: Moneda[] = ['USD', 'ARS', 'AUD', 'EUR']

export const MONEDA_POR_DEFECTO: Moneda = 'USD'
