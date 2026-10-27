import { describe, expect, it } from 'vitest'
import { agruparPorEstado, diasParaVencer, estaVencida, filtrarTareas, ordenarTareas, tareasUrgentes } from './tareas'
import { fecha, tarea } from './test-utils'

const HOY = fecha(2026, 10, 27)
const SIN_FILTROS = { responsableId: null, texto: '', verHechasViejas: false }
const ids = (lista: { id: number }[]) => lista.map((t) => t.id)

describe('vencimientos', () => {
  it('días para vencer y vencida', () => {
    expect(diasParaVencer(tarea({ fechaLimite: '2026-10-30' }), HOY)).toBe(3)
    expect(estaVencida(tarea({ fechaLimite: '2026-10-26' }), HOY)).toBe(true)
    expect(estaVencida(tarea({ fechaLimite: '2026-10-27' }), HOY)).toBe(false)
  })

  it('una tarea hecha o sin fecha no vence', () => {
    expect(diasParaVencer(tarea({ estado: 'HECHA', fechaLimite: '2026-01-01' }), HOY)).toBeNull()
    expect(diasParaVencer(tarea(), HOY)).toBeNull()
  })
})

describe('ordenarTareas', () => {
  it('prioridad, después fecha límite (sin fecha al final), después antigüedad', () => {
    const lista = [
      tarea({ id: 1, prioridad: 'BAJA', fechaLimite: '2026-10-28' }),
      tarea({ id: 2, prioridad: 'ALTA' }),
      tarea({ id: 3, prioridad: 'ALTA', fechaLimite: '2026-11-10' }),
      tarea({ id: 4, prioridad: 'MEDIA', creada: '2026-09-01' }),
      tarea({ id: 5, prioridad: 'MEDIA', creada: '2026-08-01' }),
    ]
    expect(ids(ordenarTareas(lista))).toEqual([3, 2, 5, 4, 1])
  })
})

describe('agruparPorEstado', () => {
  it('separa por estado; hechas: la última terminada primero', () => {
    const grupos = agruparPorEstado([
      tarea({ id: 1, estado: 'EN_CURSO' }),
      tarea({ id: 2, estado: 'HECHA', fechaHecha: '2026-10-01' }),
      tarea({ id: 3, estado: 'HECHA', fechaHecha: '2026-10-20' }),
      tarea({ id: 4 }),
    ])
    expect(ids(grupos.PENDIENTE)).toEqual([4])
    expect(ids(grupos.EN_CURSO)).toEqual([1])
    expect(grupos.BLOQUEADA).toEqual([])
    expect(ids(grupos.HECHA)).toEqual([3, 2])
  })
})

describe('filtrarTareas', () => {
  const lista = [
    tarea({ id: 1, responsableId: 3, titulo: 'Definir hosting', proyectoNombre: 'Web Acme' }),
    tarea({ id: 2, responsableId: 5, titulo: 'Logo', clienteNombre: 'Sur SA' }),
    tarea({ id: 3, titulo: 'Sin dueño' }),
    tarea({ id: 4, estado: 'HECHA', fechaHecha: '2026-10-20' }),
    tarea({ id: 5, estado: 'HECHA', fechaHecha: '2026-09-01' }),
  ]

  it('sin filtros oculta las hechas hace más de 14 días', () => {
    expect(ids(filtrarTareas(lista, SIN_FILTROS, HOY))).toEqual([1, 2, 3, 4])
    expect(ids(filtrarTareas(lista, { ...SIN_FILTROS, verHechasViejas: true }, HOY))).toEqual([1, 2, 3, 4, 5])
  })

  it('por responsable y sin asignar', () => {
    expect(ids(filtrarTareas(lista, { ...SIN_FILTROS, responsableId: 5 }, HOY))).toEqual([2])
    expect(ids(filtrarTareas(lista, { ...SIN_FILTROS, responsableId: 0 }, HOY))).toEqual([3, 4])
  })

  it('texto busca en título, proyecto y cliente', () => {
    expect(ids(filtrarTareas(lista, { ...SIN_FILTROS, texto: 'acme' }, HOY))).toEqual([1])
    expect(ids(filtrarTareas(lista, { ...SIN_FILTROS, texto: 'sur' }, HOY))).toEqual([2])
  })
})

describe('tareasUrgentes', () => {
  it('abiertas vencidas o que vencen en 7 días, la más urgente primero', () => {
    const resultado = tareasUrgentes(
      [
        tarea({ id: 1, fechaLimite: '2026-11-02' }),
        tarea({ id: 2, fechaLimite: '2026-10-20' }),
        tarea({ id: 3, fechaLimite: '2026-12-01' }),
        tarea({ id: 4, fechaLimite: '2026-10-21', estado: 'HECHA' }),
        tarea({ id: 5 }),
      ],
      HOY
    )
    expect(ids(resultado)).toEqual([2, 1])
  })
})
