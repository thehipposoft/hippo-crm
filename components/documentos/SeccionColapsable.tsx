'use client'

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'

const MEDIA_DESKTOP = '(min-width: 1024px)'

const suscribir = (avisar: () => void) => {
  const media = window.matchMedia(MEDIA_DESKTOP)
  media.addEventListener('change', avisar)
  return () => media.removeEventListener('change', avisar)
}
const suscribirHash = (avisar: () => void) => {
  window.addEventListener('hashchange', avisar)
  return () => window.removeEventListener('hashchange', avisar)
}
const useEsDesktop = () =>
  useSyncExternalStore(
    suscribir,
    () => window.matchMedia(MEDIA_DESKTOP).matches,
    () => false
  )

interface SeccionColapsableProps {
  id: string
  // Número y etiqueta del título (solo contenido de línea: va dentro del botón)
  titulo: ReactNode
  // Se muestra junto al título cuando está cerrada (ej. el total de la inversión)
  resumen?: string
  // En mobile arranca abierta (en desktop arrancan todas abiertas)
  abiertaEnMobile?: boolean
  children: ReactNode
}

// Sección de la propuesta que se pliega. Mientras el usuario no la toque, abierta o cerrada
// depende del ancho (por CSS, sin saltos al cargar). Ir a la sección (índice, "Siguiente") la abre.
export const SeccionColapsable = ({ id, titulo, resumen, abiertaEnMobile = false, children }: SeccionColapsableProps) => {
  const [tocada, setTocada] = useState<boolean | null>(null)
  const esDesktop = useEsDesktop()
  // Llegar con el link de la sección en la URL también la abre
  const enUrl = useSyncExternalStore(suscribirHash, () => window.location.hash === `#${id}`, () => false)
  const manual = tocada ?? (enUrl ? true : null)
  const abierta = manual ?? (esDesktop || abiertaEnMobile)
  const idPanel = `${id}-contenido`

  // Tocar un link a la sección la abre (también si es el mismo link dos veces: ahí no cambia la URL)
  useEffect(() => {
    const alClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]')
      if (link?.getAttribute('href') === `#${id}`) setTocada(true)
    }
    document.addEventListener('click', alClick)
    return () => document.removeEventListener('click', alClick)
  }, [id])

  // Sin interacción: el estado inicial lo decide el CSS según el ancho
  const segun = (siAbierta: string, siCerrada: string, enDesktop: string) =>
    manual !== null ? (manual ? siAbierta : siCerrada) : abiertaEnMobile ? siAbierta : `${siCerrada} ${enDesktop}`

  return (
    <section id={id} className="scroll-mt-20 lg:scroll-mt-8">
      <h2>
        <button
          type="button"
          aria-expanded={abierta}
          aria-controls={idPanel}
          onClick={() => setTocada(!abierta)}
          className="group flex w-full cursor-pointer items-center gap-3 text-left"
        >
          {titulo}
          <span className="ml-auto flex shrink-0 items-center gap-3">
            {resumen && (
              <span className={`whitespace-nowrap text-sm font-semibold tabular-nums ${segun('hidden', 'inline', 'lg:hidden')}`}>{resumen}</span>
            )}
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-dark-text/60 transition-[transform,color,border-color] duration-300 ease-out group-hover:border-dark-text group-hover:text-dark-text motion-reduce:transition-none ${segun(
                'rotate-180',
                'rotate-0',
                'lg:rotate-180'
              )}`}
              aria-hidden
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </span>
        </button>
      </h2>
      <div
        id={idPanel}
        inert={!abierta}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${segun(
          'grid-rows-[1fr] opacity-100',
          'grid-rows-[0fr] opacity-0',
          'lg:grid-rows-[1fr] lg:opacity-100'
        )}`}
      >
        <div className="overflow-hidden">
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </section>
  )
}
