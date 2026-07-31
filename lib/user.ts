const NOMBRES_CONOCIDOS = ['Gomi', 'Majo']

export const normalizarNombreUsuario = (nombre: string): string =>
  NOMBRES_CONOCIDOS.includes(nombre) ? nombre : 'Diego'
