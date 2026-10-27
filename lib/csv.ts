// CSV pensado para Excel/Sheets en español: separador ';', coma decimal y BOM
// para que respete los acentos.

export const SEPARADOR_CSV = ';'
const BOM = '﻿'
const FIN_DE_LINEA = '\r\n'

export type ColumnaCsv<T> = {
  titulo: string
  valor: (item: T) => string | number | null | undefined
}

const celda = (valor: string | number | null | undefined): string => {
  if (valor === null || valor === undefined) return ''
  const texto = typeof valor === 'number' ? String(valor).replace('.', ',') : valor
  return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

export const aCsv = <T>(items: readonly T[], columnas: readonly ColumnaCsv<T>[]): string => {
  const encabezado = columnas.map((c) => celda(c.titulo)).join(SEPARADOR_CSV)
  const filas = items.map((item) => columnas.map((c) => celda(c.valor(item))).join(SEPARADOR_CSV))
  return BOM + [encabezado, ...filas].join(FIN_DE_LINEA) + FIN_DE_LINEA
}
