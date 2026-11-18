'use client'

import type { ReactNode } from 'react'

// "Descargar PDF" = imprimir desde el navegador
export const BotonImprimir = ({ children, className }: { children: ReactNode; className: string }) => (
  <button type="button" onClick={() => window.print()} className={className}>
    {children}
  </button>
)
