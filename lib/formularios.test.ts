import { describe, expect, it } from 'vitest'
import { destinoSeguro } from './formularios'

describe('destinoSeguro', () => {
  it.each(['/', '/proyectos', '/proyectos/12', '/clientes/3', '/pagos', '/costos/9/editar', '/tareas'])('acepta %s', (ruta) => {
    expect(destinoSeguro(ruta, '/pagos')).toBe(ruta)
  })

  it.each([
    'https://malicioso.com',
    '//malicioso.com',
    '//evil',
    '///evil',
    '/proyectos//evil',
    '/login',
    '/proyectos/../../etc',
    '/proyectos?x=https://otro.com',
    'javascript:alert(1)',
    null,
    123,
  ])('rechaza %s', (valor) => {
    expect(destinoSeguro(valor, '/pagos')).toBe('/pagos')
  })
})
