import type { Idioma } from '@/lib/documentos/idioma'

// Elementos gráficos del manual de marca Hippo, hechos en código (nítidos en cualquier tamaño)

// Título de sección en "píldora" con sombra oliva desplazada
export const EtiquetaSeccion = ({ children, chica = false }: { children: React.ReactNode; chica?: boolean }) => (
  <span
    className={`inline-flex items-center rounded-[1.75rem] border-2 border-dark-text bg-white font-display font-bold tracking-tight text-dark-text shadow-[5px_6px_0_0_var(--color-brand-olive)] ${
      chica ? 'px-4 py-1 text-lg' : 'px-5 py-1.5 text-xl sm:px-7 sm:py-2 sm:text-3xl'
    }`}
  >
    {children}
  </span>
)

const LINEAS_SIMPLE: Record<Idioma, { lineas: string[]; tamano: number }> = {
  en: { lineas: ["Let's", 'make it', 'simple.'], tamano: 31 },
  es: { lineas: ['Hagámoslo', 'simple.'], tamano: 27 },
}
const ALTO_LINEA = 1.12

// Globo de diálogo lima "Let's make it simple."
export const StickerSimple = ({ idioma, className = '' }: { idioma: Idioma; className?: string }) => {
  const { lineas, tamano } = LINEAS_SIMPLE[idioma]
  const inicio = 80 - ((lineas.length - 1) * tamano * ALTO_LINEA) / 2 + tamano / 3
  return (
    <svg viewBox="0 0 200 196" className={`drop-shadow-lg ${className}`} role="img" aria-label={lineas.join(' ')}>
      <path
        d="M46 10 H154 A36 36 0 0 1 190 46 V114 A36 36 0 0 1 154 150 H84 L32 186 L46 150 A36 36 0 0 1 10 114 V46 A36 36 0 0 1 46 10 Z"
        className="fill-brand-green stroke-white"
        strokeWidth={9}
        strokeLinejoin="round"
        paintOrder="stroke"
      />
      <text className="fill-dark-text font-display font-extrabold" fontSize={tamano} letterSpacing={-0.5}>
        {lineas.map((linea, i) => (
          <tspan key={linea} x={30} y={inicio + i * tamano * ALTO_LINEA}>
            {linea}
          </tspan>
        ))}
      </text>
    </svg>
  )
}

// En español es una sola palabra larga: letra más chica para que entre en la nota
const TEXTO_EMPEZAMOS: Record<Idioma, { texto: string; clase: string }> = {
  en: { texto: 'Shall we start?', clase: 'text-2xl' },
  es: { texto: '¿Empezamos?', clase: 'text-xl' },
}

// Nota adhesiva lavanda "Shall we start?"
export const StickerEmpezamos = ({ idioma, className = '' }: { idioma: Idioma; className?: string }) => (
  <div
    className={`flex aspect-square w-44 -rotate-6 flex-col justify-center rounded-2xl border-[5px] border-white bg-brand-lavender p-4 shadow-lg ${className}`}
  >
    <p className={`font-display font-extrabold leading-[1.05] tracking-tight text-dark-text ${TEXTO_EMPEZAMOS[idioma].clase}`}>
      {TEXTO_EMPEZAMOS[idioma].texto}
    </p>
    <svg viewBox="0 0 100 12" className="mt-2 w-20 text-dark-text" aria-hidden>
      <path d="M2 8 C 20 2, 40 11, 60 6 S 90 4, 98 7" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  </div>
)

// Insignia redonda "H."
export const InsigniaH = ({ className = '' }: { className?: string }) => (
  <span
    className={`inline-flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-brand-white shadow-md ring-1 ring-slate-200 ${className}`}
    aria-hidden
  >
    <span className="font-display text-2xl font-black leading-none text-brand-forest">H</span>
    <span className="ml-0.5 mt-3 h-1.5 w-1.5 bg-brand-green" />
  </span>
)
