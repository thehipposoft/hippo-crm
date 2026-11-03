import { Fragment } from 'react'
import { parseMarkdown, type Linea } from '@/lib/markdown'

const Texto = ({ linea }: { linea: Linea }) => (
  <>
    {linea.map((parte, i) => {
      if (parte.tipo === 'negrita') return <strong key={i} className="font-semibold text-dark-text">{parte.texto}</strong>
      if (parte.tipo === 'cursiva') return <em key={i}>{parte.texto}</em>
      if (parte.tipo === 'link') {
        return (
          <a key={i} href={parte.href} target="_blank" rel="noopener noreferrer" className="text-dark-text underline decoration-brand-blue decoration-2 underline-offset-2">
            {parte.texto}
          </a>
        )
      }
      return <Fragment key={i}>{parte.texto}</Fragment>
    })}
  </>
)

// Contenido de una sección de propuesta (formato simple, ver lib/markdown.ts)
export const Markdown = ({ texto }: { texto: string }) => (
  <div className="space-y-3 text-[0.9375rem] leading-relaxed text-dark-text/80">
    {parseMarkdown(texto).map((bloque, i) => {
      if (bloque.tipo === 'subtitulo') {
        return (
          <h3 key={i} className="pt-2 text-base font-semibold text-dark-text">
            <Texto linea={bloque.contenido} />
          </h3>
        )
      }
      if (bloque.tipo === 'lista') {
        const Lista = bloque.ordenada ? 'ol' : 'ul'
        return (
          <Lista key={i} className={`space-y-1.5 pl-5 ${bloque.ordenada ? 'list-decimal marker:font-semibold marker:text-dark-text' : 'list-none'}`}>
            {bloque.items.map((item, j) => (
              <li key={j} className={bloque.ordenada ? 'pl-1' : 'relative'}>
                {!bloque.ordenada && <span className="absolute -left-4 top-[0.6em] h-1.5 w-1.5 bg-brand-blue" aria-hidden />}
                <Texto linea={item.contenido} />
                {item.subitems.length > 0 && (
                  <ul className="mt-1 space-y-1 pl-4">
                    {item.subitems.map((sub, k) => (
                      <li key={k} className="relative">
                        <span className="absolute -left-3.5 top-[0.65em] h-1 w-1 rounded-full bg-dark-text/40" aria-hidden />
                        <Texto linea={sub} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </Lista>
        )
      }
      if (bloque.tipo === 'tabla') {
        return (
          <div key={i} className="overflow-x-auto rounded-xl border border-slate-200 print:overflow-visible">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-dark-text text-left text-xs uppercase tracking-wider text-white">
                  {bloque.encabezado.map((celda, j) => (
                    <th key={j} className="px-4 py-2.5 font-medium">
                      <Texto linea={celda} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bloque.filas.map((fila, j) => (
                  <tr key={j} className="border-t border-slate-100 align-top">
                    {fila.map((celda, k) => (
                      <td key={k} className={`px-4 py-2.5 ${k === 0 ? 'font-medium text-dark-text' : ''}`}>
                        <Texto linea={celda} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      return (
        <p key={i}>
          {bloque.lineas.map((linea, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              <Texto linea={linea} />
            </Fragment>
          ))}
        </p>
      )
    })}
  </div>
)
