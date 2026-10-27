'use client'

import { usePathname, useSearchParams } from 'next/navigation'

// Lee y escribe query params con history.replaceState: Next lo sincroniza con
// useSearchParams sin volver a pedir datos al server. Sirve para que filtros y
// orden sobrevivan al volver desde una ficha.
export const useParamsUrl = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const set = (cambios: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === null || valor === '') params.delete(clave)
      else params.set(clave, valor)
    }
    const query = params.toString()
    window.history.replaceState(null, '', query ? `${pathname}?${query}` : pathname)
  }

  return { get: (clave: string): string | null => searchParams.get(clave), set }
}

export const descargarArchivo = (nombre: string, contenido: string, tipo: string) => {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }))
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  enlace.click()
  URL.revokeObjectURL(url)
}
