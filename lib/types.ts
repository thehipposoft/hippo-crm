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
  empresa: string | null
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
}

export type PagoRow = {
  id: number
  proyectoId: number
  proyectoNombre: string | null
  clienteNombre: string | null
  fecha: string | null
  monto: number
  medioPago: string | null
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
