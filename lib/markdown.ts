// Formato simple para las secciones de las propuestas (subconjunto de Markdown):
//   ### Subtítulo          - ítem / * ítem (con sangría: subítem)      1. ítem numerado
//   **negrita**  *cursiva*  [texto](https://link)                       | tabla | con | barras |
// Se parsea a bloques y se renderiza con React (nunca HTML crudo).

export type Inline =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'negrita'; texto: string }
  | { tipo: 'cursiva'; texto: string }
  | { tipo: 'link'; texto: string; href: string }

export type Linea = Inline[]

export type ItemLista = { contenido: Linea; subitems: Linea[] }

export type Bloque =
  | { tipo: 'parrafo'; lineas: Linea[] }
  | { tipo: 'subtitulo'; contenido: Linea }
  | { tipo: 'lista'; ordenada: boolean; items: ItemLista[] }
  | { tipo: 'tabla'; encabezado: Linea[]; filas: Linea[][] }

const PATRON_SUBTITULO = /^#{1,4}\s+(.*)$/
const PATRON_VINETA = /^(\s*)[-*•○]\s+(.*)$/
const PATRON_NUMERO = /^(\s*)\d+[.)]\s+(.*)$/
const PATRON_FILA_TABLA = /^\s*\|.*\|\s*$/
const PATRON_SEPARADOR_TABLA = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/
const PATRON_INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?![*\w])|(?<!\w)_(?!\s)(.+?)(?<!\s)_(?!\w)/g
const SANGRIA_SUBITEM = 2

export const parseInline = (texto: string): Linea => {
  const salida: Linea = []
  let ultimo = 0
  for (const m of texto.matchAll(PATRON_INLINE)) {
    const inicio = m.index ?? 0
    if (inicio > ultimo) salida.push({ tipo: 'texto', texto: texto.slice(ultimo, inicio) })
    if (m[1] !== undefined) salida.push({ tipo: 'negrita', texto: m[1] })
    else if (m[2] !== undefined && m[3] !== undefined) salida.push({ tipo: 'link', texto: m[2], href: m[3] })
    else salida.push({ tipo: 'cursiva', texto: m[4] ?? m[5] ?? '' })
    ultimo = inicio + m[0].length
  }
  if (ultimo < texto.length) salida.push({ tipo: 'texto', texto: texto.slice(ultimo) })
  return salida
}

const celdas = (linea: string): Linea[] =>
  linea
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => parseInline(c.trim()))

const itemDeLista = (linea: string): { ordenada: boolean; sangria: number; texto: string } | null => {
  const vineta = linea.match(PATRON_VINETA)
  if (vineta) return { ordenada: false, sangria: vineta[1].replace(/\t/g, '  ').length, texto: vineta[2] }
  const numero = linea.match(PATRON_NUMERO)
  if (numero) return { ordenada: true, sangria: numero[1].replace(/\t/g, '  ').length, texto: numero[2] }
  return null
}

export const parseMarkdown = (texto: string): Bloque[] => {
  const lineas = texto.replace(/\r\n?/g, '\n').split('\n')
  const bloques: Bloque[] = []
  let i = 0

  while (i < lineas.length) {
    const linea = lineas[i]
    if (linea.trim() === '') {
      i++
      continue
    }

    const subtitulo = linea.match(PATRON_SUBTITULO)
    if (subtitulo) {
      bloques.push({ tipo: 'subtitulo', contenido: parseInline(subtitulo[1].trim()) })
      i++
      continue
    }

    // Tabla: fila de encabezado + separador |---|---|
    if (PATRON_FILA_TABLA.test(linea) && PATRON_SEPARADOR_TABLA.test(lineas[i + 1] ?? '')) {
      const encabezado = celdas(linea)
      const filas: Linea[][] = []
      i += 2
      while (i < lineas.length && PATRON_FILA_TABLA.test(lineas[i])) {
        filas.push(celdas(lineas[i]))
        i++
      }
      bloques.push({ tipo: 'tabla', encabezado, filas })
      continue
    }

    const primero = itemDeLista(linea)
    if (primero && primero.sangria < SANGRIA_SUBITEM) {
      const items: ItemLista[] = []
      while (i < lineas.length) {
        const item = itemDeLista(lineas[i])
        if (!item) break
        if (item.sangria >= SANGRIA_SUBITEM && items.length > 0) {
          items[items.length - 1].subitems.push(parseInline(item.texto))
        } else if (item.ordenada === primero.ordenada) {
          items.push({ contenido: parseInline(item.texto), subitems: [] })
        } else {
          break
        }
        i++
      }
      bloques.push({ tipo: 'lista', ordenada: primero.ordenada, items })
      continue
    }

    // Párrafo: líneas seguidas hasta una vacía o un bloque de otro tipo
    const parrafo: Linea[] = []
    while (i < lineas.length) {
      const actual = lineas[i]
      if (actual.trim() === '' || PATRON_SUBTITULO.test(actual) || itemDeLista(actual)) break
      if (PATRON_FILA_TABLA.test(actual) && PATRON_SEPARADOR_TABLA.test(lineas[i + 1] ?? '')) break
      parrafo.push(parseInline(actual.trim()))
      i++
    }
    bloques.push({ tipo: 'parrafo', lineas: parrafo })
  }

  return bloques
}
