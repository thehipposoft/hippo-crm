// Tuplas `as const`: fuente única para los tipos y para los schemas de Zod
export const ESTADO_VALUES = ['PROSPECTO', 'EN_NEGOCIACION', 'ACTIVO', 'EN_PAUSA', 'CERRADO', 'PERDIDO'] as const
export type Estado = (typeof ESTADO_VALUES)[number]

export const TIPO_PROYECTO_VALUES = ['ON_OFF', 'RECURRENTE'] as const
export type TipoProyecto = (typeof TIPO_PROYECTO_VALUES)[number]

export const FRECUENCIA_VALUES = ['SEMANAL', 'MENSUAL', 'ANUAL'] as const
export type FrecuenciaPago = (typeof FRECUENCIA_VALUES)[number]

export const MONEDAS = ['USD', 'ARS', 'AUD', 'EUR'] as const
export type Moneda = (typeof MONEDAS)[number]

export const MONEDA_POR_DEFECTO: Moneda = 'USD'

export type ClienteRow = {
  id: number
  nombre: string
  contacto: string | null
  telefono: string | null
  emailContacto: string | null
  pais: string | null
  // Token del link público del estado de cuenta; null = sin link
  tokenPublico?: string | null
}

// Lo que ve el cliente en el link público (sin datos internos)
export type ClientePublico = Pick<ClienteRow, 'nombre' | 'contacto' | 'emailContacto' | 'pais'>

export type EstadoPublico = {
  cliente: ClientePublico
  proyectos: ProyectoRow[]
  pagos: PagoRow[]
}

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
  // Cobro por unidad (ej. 'casilla'): valor = precio por unidad por mes. null = cobro normal
  unidad?: string | null
  unidades?: UnidadRow[]
}

// Unidad cobrada por mes dentro de un proyecto (ej. una casilla de correo)
export type UnidadRow = {
  id: number
  proyectoId: number
  nombre: string
  fechaAlta: string | null
  fechaBaja: string | null
  notas: string | null
}

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
export const MEDIO_PAGO_POR_DEFECTO = MEDIOS_PAGO[0]

export const TIPOS_PROYECTO: { value: TipoProyecto; label: string }[] = [
  { value: 'ON_OFF', label: 'On-off' },
  { value: 'RECURRENTE', label: 'Recurrente' },
]

export const FRECUENCIAS_PAGO: { value: FrecuenciaPago; label: string }[] = [
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'ANUAL', label: 'Anual' },
]

// ==== Tareas (to-do del equipo) ====

export const ESTADO_TAREA_VALUES = ['PENDIENTE', 'EN_CURSO', 'BLOQUEADA', 'HECHA'] as const
export type EstadoTarea = (typeof ESTADO_TAREA_VALUES)[number]

export const ESTADOS_TAREA: { value: EstadoTarea; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_CURSO', label: 'En curso' },
  { value: 'BLOQUEADA', label: 'Bloqueada' },
  { value: 'HECHA', label: 'Hecha' },
]

export const PRIORIDAD_VALUES = ['ALTA', 'MEDIA', 'BAJA'] as const
export type Prioridad = (typeof PRIORIDAD_VALUES)[number]

export const PRIORIDADES: { value: Prioridad; label: string }[] = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
]

export type TareaRow = {
  id: number
  titulo: string
  descripcion: string | null
  estado: EstadoTarea
  prioridad: Prioridad
  responsableId: number | null
  responsableNombre: string | null
  fechaLimite: string | null
  proyectoId: number | null
  proyectoNombre: string | null
  clienteNombre: string | null
  // 'YYYY-MM-DD'
  creada: string
  fechaHecha: string | null
}

export type UsuarioRow = { id: number; nombre: string }
