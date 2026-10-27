import { diasEntre, hoy, parseFecha, type FechaCalendario } from './fechas'
import { claveFecha, ordenarPor } from './orden'
import { PRIORIDAD_VALUES, type EstadoTarea, type TareaRow } from './types'

// Hechas hace más de esto se ocultan del tablero (siguen en "Ver hechas")
export const DIAS_HECHAS_VISIBLES = 14
export const DIAS_AVISO_TAREAS = 7

export const estaAbierta = (t: TareaRow): boolean => t.estado !== 'HECHA'

// Días hasta la fecha límite (negativo = vencida); null si no tiene o ya está hecha
export const diasParaVencer = (t: TareaRow, fechaHoy: FechaCalendario = hoy()): number | null => {
  const limite = parseFecha(t.fechaLimite)
  return limite && estaAbierta(t) ? diasEntre(fechaHoy, limite) : null
}

export const estaVencida = (t: TareaRow, fechaHoy: FechaCalendario = hoy()): boolean =>
  (diasParaVencer(t, fechaHoy) ?? 0) < 0

// Orden de trabajo: prioridad, después lo que vence antes (sin fecha al final), después lo más viejo
export const ordenarTareas = (tareas: readonly TareaRow[]): TareaRow[] =>
  ordenarPor(
    tareas,
    {
      valor: (t) => [PRIORIDAD_VALUES.indexOf(t.prioridad), claveFecha(t.fechaLimite) ?? '9999-12-31', t.creada, t.id],
      direccionInicial: 'asc',
    },
    'asc'
  )

// Hechas: lo último terminado primero
const ordenarHechas = (tareas: readonly TareaRow[]): TareaRow[] =>
  ordenarPor(tareas, { valor: (t) => [claveFecha(t.fechaHecha) ?? t.creada, t.id], direccionInicial: 'desc' }, 'desc')

export type FiltrosTareas = {
  // null = todos; 0 = sin asignar
  responsableId: number | null
  texto: string
  verHechasViejas: boolean
}

export const filtrarTareas = (
  tareas: readonly TareaRow[],
  filtros: FiltrosTareas,
  fechaHoy: FechaCalendario = hoy()
): TareaRow[] => {
  const q = filtros.texto.trim().toLowerCase()
  return tareas.filter((t) => {
    if (filtros.responsableId === 0 && t.responsableId !== null) return false
    if (filtros.responsableId && t.responsableId !== filtros.responsableId) return false
    if (q && ![t.titulo, t.descripcion, t.proyectoNombre, t.clienteNombre].some((c) => c?.toLowerCase().includes(q))) {
      return false
    }
    if (t.estado === 'HECHA' && !filtros.verHechasViejas) {
      const hecha = parseFecha(t.fechaHecha)
      if (hecha && diasEntre(hecha, fechaHoy) > DIAS_HECHAS_VISIBLES) return false
    }
    return true
  })
}

export const agruparPorEstado = (tareas: readonly TareaRow[]): Record<EstadoTarea, TareaRow[]> => {
  const grupos: Record<EstadoTarea, TareaRow[]> = { PENDIENTE: [], EN_CURSO: [], BLOQUEADA: [], HECHA: [] }
  for (const t of tareas) grupos[t.estado].push(t)
  return {
    PENDIENTE: ordenarTareas(grupos.PENDIENTE),
    EN_CURSO: ordenarTareas(grupos.EN_CURSO),
    BLOQUEADA: ordenarTareas(grupos.BLOQUEADA),
    HECHA: ordenarHechas(grupos.HECHA),
  }
}

// Para el dashboard: abiertas vencidas o que vencen pronto, más urgentes primero
export const tareasUrgentes = (tareas: readonly TareaRow[], fechaHoy: FechaCalendario = hoy()): TareaRow[] =>
  ordenarPor(
    tareas.filter((t) => {
      const dias = diasParaVencer(t, fechaHoy)
      return dias !== null && dias <= DIAS_AVISO_TAREAS
    }),
    { valor: (t) => [claveFecha(t.fechaLimite), PRIORIDAD_VALUES.indexOf(t.prioridad)], direccionInicial: 'asc' },
    'asc'
  )
