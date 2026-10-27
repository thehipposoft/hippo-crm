// Orden de tablas. Sin dependencias de React: se puede testear suelto.

export type Direccion = 'asc' | 'desc'

type Primitivo = string | number | null | undefined
// Una tupla ordena por varias claves en cascada (ej. [moneda, monto])
export type ValorOrden = Primitivo | readonly Primitivo[]

export type ColumnaOrden<T> = {
  valor: (item: T) => ValorOrden
  // Dirección al hacer el primer click (fechas y montos: más nuevo / más grande primero)
  direccionInicial: Direccion
}

const esVacio = (valor: Primitivo): boolean =>
  valor === null || valor === undefined || valor === '' || (typeof valor === 'number' && Number.isNaN(valor))

const compararPrimitivos = (a: Primitivo, b: Primitivo): number => {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'es', { sensitivity: 'base', numeric: true })
}

const aLista = (valor: ValorOrden): readonly Primitivo[] => (Array.isArray(valor) ? valor : [valor as Primitivo])

// Orden estable; los vacíos van siempre al final, en cualquier dirección
export const ordenarPor = <T>(items: readonly T[], columna: ColumnaOrden<T>, direccion: Direccion): T[] => {
  const signo = direccion === 'asc' ? 1 : -1
  return items
    .map((item, indice) => ({ item, indice, claves: aLista(columna.valor(item)) }))
    .sort((a, b) => {
      const largo = Math.max(a.claves.length, b.claves.length)
      for (let i = 0; i < largo; i++) {
        const x = a.claves[i]
        const y = b.claves[i]
        const xVacio = esVacio(x)
        const yVacio = esVacio(y)
        if (xVacio && yVacio) continue
        if (xVacio) return 1
        if (yVacio) return -1
        const comparacion = compararPrimitivos(x, y)
        if (comparacion !== 0) return comparacion * signo
      }
      return a.indice - b.indice
    })
    .map(({ item }) => item)
}

// Fechas 'YYYY-MM-DD' (o ISO con hora): se comparan como texto
export const claveFecha = (valor: string | null | undefined): string | null => valor?.slice(0, 10) || null
