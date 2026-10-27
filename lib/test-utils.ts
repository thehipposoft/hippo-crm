// Helpers solo para tests (no se importan desde la app)
import type { FechaCalendario } from './fechas'
import type { CostoRow, PagoRow, ProyectoRow } from './types'

// Mes 1-12, como se escribe a mano
export const fecha = (anio: number, mes: number, dia: number): FechaCalendario => ({ anio, mes: mes - 1, dia })

// Intl usa espacio no separable entre "US$" y el número
export const normalizarEspacios = (texto: string): string => texto.replace(/ /g, ' ')

export const proyecto = (datos: Partial<ProyectoRow> = {}): ProyectoRow => ({
  id: 1,
  nombre: 'Proyecto',
  clienteId: 1,
  clienteNombre: 'Cliente',
  estado: 'ACTIVO',
  fechaInicio: null,
  deadline: null,
  accionPendiente: null,
  tipoProyecto: 'ON_OFF',
  valor: 1000,
  moneda: 'USD',
  frecuenciaPago: null,
  url: null,
  ...datos,
})

export const recurrente = (datos: Partial<ProyectoRow> = {}): ProyectoRow =>
  proyecto({ tipoProyecto: 'RECURRENTE', valor: 300, frecuenciaPago: 'MENSUAL', fechaInicio: '2026-08-15', ...datos })

export const pago = (datos: Partial<PagoRow> = {}): PagoRow => ({
  id: 1,
  proyectoId: 1,
  proyectoNombre: 'Proyecto',
  clienteNombre: 'Cliente',
  fecha: '2026-10-01',
  monto: 100,
  moneda: 'USD',
  medioPago: 'Transferencia',
  notas: null,
  ...datos,
})

export const costo = (datos: Partial<CostoRow> = {}): CostoRow => ({
  id: 1,
  nombreCosto: 'Costo',
  monto: 10,
  moneda: 'USD',
  metodoPago: 'Tarjeta',
  frecuencia: 'MENSUAL',
  fechaRenovacion: null,
  fechaInicio: null,
  fechaBaja: null,
  ...datos,
})
