import { describe, expect, it } from 'vitest'
import { aCsv } from './csv'

type Fila = { fecha: string; monto: number; notas: string | null }
const COLUMNAS = [
  { titulo: 'Fecha', valor: (f: Fila) => f.fecha },
  { titulo: 'Monto', valor: (f: Fila) => f.monto },
  { titulo: 'Notas', valor: (f: Fila) => f.notas },
]

describe('aCsv', () => {
  it('BOM, separador ; y coma decimal', () => {
    const csv = aCsv([{ fecha: '2026-10-01', monto: 1500.5, notas: null }], COLUMNAS)
    expect(csv).toBe('﻿Fecha;Monto;Notas\r\n2026-10-01;1500,5;\r\n')
  })

  it('escapa ; comillas y saltos de línea', () => {
    const csv = aCsv([{ fecha: 'x', monto: 1, notas: 'Anticipo; 50% "seña"\nresto' }], COLUMNAS)
    expect(csv.split('\r\n')[1]).toBe('x;1;"Anticipo; 50% ""seña""\nresto"')
  })

  it('sin filas devuelve solo el encabezado', () => {
    expect(aCsv([], COLUMNAS)).toBe('﻿Fecha;Monto;Notas\r\n')
  })
})
