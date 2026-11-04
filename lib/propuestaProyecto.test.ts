import { describe, expect, it } from 'vitest'
import { resumenPropuestaProyecto } from './propuestaProyecto'
import { propuesta } from './test-utils'

const proyecto = { id: 5, propuestaEnviada: null, propuestaAprobada: null }

describe('resumenPropuestaProyecto', () => {
  it('sin nada: todo vacío', () => {
    expect(resumenPropuestaProyecto(proyecto, [])).toEqual({ vinculadas: [], enviada: null, aprobada: null, dias: null })
  })

  it('desde las propuestas del CRM vinculadas (día en Argentina)', () => {
    const p = propuesta({ id: 9, proyectoId: 5, estado: 'ACEPTADA', enviadaEl: '2026-10-20T02:00:00Z', respondidaEl: '2026-10-28T15:00:00Z' })
    const otra = propuesta({ id: 10, proyectoId: 6, estado: 'ACEPTADA', enviadaEl: '2026-10-01T15:00:00Z' })
    const r = resumenPropuestaProyecto(proyecto, [p, otra])
    expect(r.vinculadas.map((x) => x.id)).toEqual([9])
    expect(r.enviada).toMatchObject({ fecha: '2026-10-19', origen: { tipo: 'CRM' } })
    expect(r.aprobada).toMatchObject({ fecha: '2026-10-28' })
    expect(r.dias).toBe(9)
  })

  it('una rechazada no cuenta como aprobada', () => {
    const p = propuesta({ proyectoId: 5, estado: 'RECHAZADA', enviadaEl: '2026-10-20T15:00:00Z', respondidaEl: '2026-10-21T15:00:00Z' })
    expect(resumenPropuestaProyecto(proyecto, [p]).aprobada).toBeNull()
  })

  it('el registro manual manda sobre el CRM', () => {
    const p = propuesta({ proyectoId: 5, estado: 'ACEPTADA', enviadaEl: '2026-10-20T15:00:00Z', respondidaEl: '2026-10-28T15:00:00Z' })
    const r = resumenPropuestaProyecto({ ...proyecto, propuestaEnviada: '2026-09-01' }, [p])
    expect(r.enviada).toEqual({ fecha: '2026-09-01', origen: { tipo: 'MANUAL' } })
    expect(r.aprobada?.origen.tipo).toBe('CRM')
    expect(r.dias).toBe(57)
  })
})
