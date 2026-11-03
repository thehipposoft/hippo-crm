import { describe, expect, it } from 'vitest'
import { parseInline, parseMarkdown } from './markdown'

describe('parseInline', () => {
  it('negrita, cursiva y links', () => {
    expect(parseInline('Hola **mundo** y *algo* con [link](https://hippo.com).')).toEqual([
      { tipo: 'texto', texto: 'Hola ' },
      { tipo: 'negrita', texto: 'mundo' },
      { tipo: 'texto', texto: ' y ' },
      { tipo: 'cursiva', texto: 'algo' },
      { tipo: 'texto', texto: ' con ' },
      { tipo: 'link', texto: 'link', href: 'https://hippo.com' },
      { tipo: 'texto', texto: '.' },
    ])
  })

  it('no acepta links con javascript:', () => {
    expect(parseInline('[x](javascript:alert(1))')).toEqual([{ tipo: 'texto', texto: '[x](javascript:alert(1))' }])
  })

  it('un asterisco suelto o 2*3 no es cursiva', () => {
    expect(parseInline('precio 2*3 y 4*5')).toEqual([{ tipo: 'texto', texto: 'precio 2*3 y 4*5' }])
  })
})

describe('parseMarkdown', () => {
  it('párrafos separados por línea vacía; líneas seguidas en el mismo párrafo', () => {
    const b = parseMarkdown('uno\ndos\n\ntres')
    expect(b).toHaveLength(2)
    expect(b[0]).toMatchObject({ tipo: 'parrafo', lineas: [[{ texto: 'uno' }], [{ texto: 'dos' }]] })
  })

  it('subtítulos y listas con subítems', () => {
    const b = parseMarkdown('### Alcance\n- uno\n  - sub\n- dos\n1. a\n2. b')
    expect(b.map((x) => x.tipo)).toEqual(['subtitulo', 'lista', 'lista'])
    expect(b[1]).toMatchObject({ ordenada: false, items: [{ subitems: [[{ texto: 'sub' }]] }, { subitems: [] }] })
    expect(b[2]).toMatchObject({ ordenada: true })
  })

  it('tablas', () => {
    const b = parseMarkdown('| Etapa | Tiempo |\n|---|---|\n| Diseño | 2 semanas |\n| Dev | **4** |\ntexto')
    expect(b[0]).toMatchObject({
      tipo: 'tabla',
      encabezado: [[{ texto: 'Etapa' }], [{ texto: 'Tiempo' }]],
      filas: [
        [[{ texto: 'Diseño' }], [{ texto: '2 semanas' }]],
        [[{ texto: 'Dev' }], [{ tipo: 'negrita', texto: '4' }]],
      ],
    })
    expect(b[1]).toMatchObject({ tipo: 'parrafo' })
  })

  it('una línea con barras sin separador es párrafo', () => {
    expect(parseMarkdown('| hola |')[0]).toMatchObject({ tipo: 'parrafo' })
  })
})
