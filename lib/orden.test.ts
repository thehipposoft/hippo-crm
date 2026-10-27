import { describe, expect, it } from 'vitest'
import { claveFecha, ordenarPor, type ColumnaOrden } from './orden'

type Fila = { id: number; fecha: string | null; moneda: string; monto: number; nombre?: string }

const filas: Fila[] = [
  { id: 1, fecha: '2026-10-01', moneda: 'USD', monto: 100 },
  { id: 2, fecha: null, moneda: 'USD', monto: 50 },
  { id: 3, fecha: '2026-10-20', moneda: 'ARS', monto: 900000 },
  { id: 4, fecha: '2026-10-20', moneda: 'USD', monto: 3000 },
  { id: 5, fecha: '', moneda: 'USD', monto: 1 },
]

const porFecha: ColumnaOrden<Fila> = { valor: (f) => [claveFecha(f.fecha), f.id], direccionInicial: 'desc' }
const ids = (lista: Fila[]) => lista.map((f) => f.id)

describe('ordenarPor', () => {
  it('fecha descendente, empate por id', () => {
    expect(ids(ordenarPor(filas, porFecha, 'desc')).slice(0, 3)).toEqual([4, 3, 1])
  })

  it('los vacíos van al final en las dos direcciones', () => {
    expect(ids(ordenarPor(filas, porFecha, 'desc')).slice(3).sort()).toEqual([2, 5])
    expect(ids(ordenarPor(filas, porFecha, 'asc')).slice(3).sort()).toEqual([2, 5])
  })

  it('montos agrupados por moneda', () => {
    const resultado = ordenarPor(filas, { valor: (f) => [f.moneda, f.monto], direccionInicial: 'desc' }, 'desc')
    expect(ids(resultado)).toEqual([4, 1, 2, 5, 3])
  })

  it('textos: ignora acentos y mayúsculas, números naturales', () => {
    const nombres = ['árbol', 'Zeta', 'avión', 'Proyecto 10', 'Proyecto 2'].map((nombre, i) => ({ ...filas[0], id: i, nombre }))
    const resultado = ordenarPor(nombres, { valor: (f) => f.nombre, direccionInicial: 'asc' }, 'asc')
    expect(resultado.map((f) => f.nombre)).toEqual(['árbol', 'avión', 'Proyecto 2', 'Proyecto 10', 'Zeta'])
  })

  it('es estable y no modifica el array original', () => {
    const copia = [...filas]
    const resultado = ordenarPor(filas, { valor: (f) => f.moneda, direccionInicial: 'asc' }, 'asc')
    expect(ids(resultado)).toEqual([3, 1, 2, 4, 5])
    expect(filas).toEqual(copia)
  })
})
