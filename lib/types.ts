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
  // Registro manual de la propuesta (hecha fuera del CRM). 'YYYY-MM-DD'
  propuestaEnviada?: string | null
  propuestaAprobada?: string | null
  archivos?: ArchivoRow[]
}

export const TIPO_ARCHIVO_VALUES = ['PROPUESTA', 'CONTRATO', 'OTRO'] as const
export type TipoArchivo = (typeof TIPO_ARCHIVO_VALUES)[number]

export const TIPOS_ARCHIVO: { value: TipoArchivo; label: string }[] = [
  { value: 'PROPUESTA', label: 'Propuesta' },
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'OTRO', label: 'Otro' },
]

// Archivo de un proyecto (privado en WordPress: se baja con un link temporal)
export type ArchivoRow = {
  id: number
  nombre: string
  tipo: TipoArchivo
  mime: string | null
  // Bytes
  tamano: number
  // Fecha y hora UTC (ISO 8601)
  subidoEl: string | null
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
  categoria?: CategoriaCosto | null
  // Pagos registrados (vienen embebidos desde WordPress)
  pagos?: PagoCostoRow[]
}

export const CATEGORIA_COSTO_VALUES = ['SUELDO', 'SUSCRIPCION', 'HOSTING', 'SERVICIO', 'IMPUESTO', 'OTRO'] as const
export type CategoriaCosto = (typeof CATEGORIA_COSTO_VALUES)[number]

export const CATEGORIAS_COSTO: { value: CategoriaCosto; label: string }[] = [
  { value: 'SUELDO', label: 'Sueldo' },
  { value: 'SUSCRIPCION', label: 'Suscripción' },
  { value: 'HOSTING', label: 'Hosting' },
  { value: 'SERVICIO', label: 'Servicio' },
  { value: 'IMPUESTO', label: 'Impuesto' },
  { value: 'OTRO', label: 'Otro' },
]

// Pago hecho de un costo. `periodo` es qué cubre ('YYYY-MM', o 'YYYY' en anuales);
// `fecha` es cuándo se pagó (el sueldo de octubre puede pagarse el 5 de noviembre).
export type PagoCostoRow = {
  id: number
  costoId: number
  fecha: string | null
  periodo: string | null
  monto: number
  moneda: Moneda
  metodoPago: string | null
  notas: string | null
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

// ==== Propuestas y cotizaciones ====
// Propuesta: documento detallado (secciones + inversión). Cotización: lista de ítems con vencimiento.
export const TIPO_PROPUESTA_VALUES = ['PROPUESTA', 'COTIZACION'] as const
export type TipoPropuesta = (typeof TIPO_PROPUESTA_VALUES)[number]

export const TIPOS_PROPUESTA: { value: TipoPropuesta; label: string }[] = [
  { value: 'PROPUESTA', label: 'Propuesta' },
  { value: 'COTIZACION', label: 'Cotización' },
]

export const ESTADO_PROPUESTA_VALUES = ['BORRADOR', 'ENVIADA', 'ACEPTADA', 'RECHAZADA'] as const
export type EstadoPropuesta = (typeof ESTADO_PROPUESTA_VALUES)[number]

export const IDIOMA_VALUES = ['es', 'en'] as const
export type IdiomaDocumento = (typeof IDIOMA_VALUES)[number]

export type ItemPropuesta = {
  descripcion: string
  // Texto debajo de la descripción (qué incluye)
  detalle: string | null
  // Tiempo estimado (ej. '2 semanas')
  plazo: string | null
  cantidad: number
  precio: number
}

// `contenido`: texto con formato simple (ver lib/markdown.ts)
export type SeccionPropuesta = { titulo: string; contenido: string }

// Lo que comparten plantillas y propuestas
type ContenidoPropuesta = {
  id: number
  tipo: TipoPropuesta
  idioma: IdiomaDocumento
  secciones: SeccionPropuesta[]
  items: ItemPropuesta[]
  // Condiciones / observaciones al pie del documento
  notas: string | null
}

export type PlantillaRow = ContenidoPropuesta & { nombre: string }

export type PropuestaRow = ContenidoPropuesta & {
  titulo: string
  // Bajada de la portada
  resumen: string | null
  estado: EstadoPropuesta
  clienteId: number | null
  clienteNombre: string | null
  proyectoId: number | null
  proyectoNombre: string | null
  moneda: Moneda | null
  fecha: string
  // Propuesta: válida hasta. Cotización: vencimiento del pago.
  fechaVencimiento: string | null
  descuento: number
  cuentas: number[]
  token: string | null
  // Fecha y hora UTC (ISO 8601)
  enviadaEl: string | null
  vistaEl: string | null
  respondidaEl: string | null
  respuestaNombre: string | null
  respuestaComentario: string | null
}

export type CuentaBancariaRow = {
  id: number
  // Alias interno (ej. 'Wise EUR')
  nombre: string
  moneda: Moneda | null
  // Texto tal cual se muestra en el documento (titular, IBAN, BIC, alias, etc.)
  detalle: string
}

// Lo que ve el cliente con el link (sin token, fechas internas ni datos del CRM)
export type PropuestaPublica = Pick<
  PropuestaRow,
  | 'id'
  | 'tipo'
  | 'idioma'
  | 'titulo'
  | 'resumen'
  | 'estado'
  | 'moneda'
  | 'fecha'
  | 'fechaVencimiento'
  | 'descuento'
  | 'secciones'
  | 'items'
  | 'notas'
  | 'respondidaEl'
  | 'respuestaNombre'
> & {
  cliente: { nombre: string | null; contacto: string | null; pais: string | null }
  cuentas: { nombre: string; detalle: string }[]
  vencida: boolean
}

// ==== Portal de clientes ====

export const ESTADO_ACCESO_VALUES = ['INVITADO', 'ACTIVO', 'DESACTIVADO'] as const
export type EstadoAcceso = (typeof ESTADO_ACCESO_VALUES)[number]

// Persona del cliente con acceso al portal (no es un usuario de WordPress)
export type AccesoRow = {
  id: number
  clienteId: number
  nombre: string
  email: string
  estado: EstadoAcceso
  // Fecha y hora UTC (ISO 8601)
  invitadoEl: string | null
  ultimoAcceso: string | null
}

export type PropuestaPortal = Pick<
  PropuestaRow,
  'id' | 'tipo' | 'titulo' | 'estado' | 'moneda' | 'fecha' | 'fechaVencimiento' | 'descuento' | 'items' | 'token' | 'respondidaEl'
> & { vencida: boolean }

export type EstadoPortal = EstadoPublico & {
  propuestas: PropuestaPortal[]
  acceso: { nombre: string; email: string }
}
