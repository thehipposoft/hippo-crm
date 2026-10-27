'use client'

import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
} from 'react'
import { ESTADO_FORMULARIO_INICIAL, type AccionFormulario, type EstadoFormulario } from '@/lib/formularios'

const ErroresContext = createContext<EstadoFormulario['errores']>({})

const useErrorDe = (nombre: string): string | undefined => useContext(ErroresContext)[nombre]

const CLASES_CONTROL =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue aria-invalid:border-rose-400'

interface FormularioProps {
  accion: AccionFormulario
  textoBoton: string
  children: ReactNode
}

// Envía con onSubmit (no `action`) para que React no resetee el form:
// si el server devuelve errores, lo que escribió el usuario queda en los campos.
export const Formulario = ({ accion, textoBoton, children }: FormularioProps) => {
  const [estado, dispatch, pending] = useActionState(accion, ESTADO_FORMULARIO_INICIAL)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => dispatch(formData))
  }

  return (
    <ErroresContext.Provider value={estado.errores}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}

        {estado.error && (
          <p role="alert" className="pt-1 text-xs text-rose-600">
            {estado.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Guardando...' : textoBoton}
        </button>
      </form>
    </ErroresContext.Provider>
  )
}

interface CampoProps {
  nombre: string
  label: string
  ayuda?: string
  children: ReactNode
}

// Label + control + error del server (o texto de ayuda)
export const Campo = ({ nombre, label, ayuda, children }: CampoProps) => {
  const error = useErrorDe(nombre)
  return (
    <div>
      <label htmlFor={nombre} className="mb-1.5 block text-xs font-medium text-dark-text/60">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : (
        ayuda && <p className="mt-1 text-xs text-dark-text/40">{ayuda}</p>
      )}
    </div>
  )
}

type ConNombre<T extends 'input' | 'select' | 'textarea'> = Omit<ComponentProps<T>, 'name' | 'id' | 'className'> & {
  name: string
}

export const Input = ({ name, ...props }: ConNombre<'input'>) => (
  <input id={name} name={name} aria-invalid={useErrorDe(name) ? true : undefined} className={CLASES_CONTROL} {...props} />
)

export const Select = ({ name, ...props }: ConNombre<'select'>) => (
  <select id={name} name={name} aria-invalid={useErrorDe(name) ? true : undefined} className={CLASES_CONTROL} {...props} />
)

export const Textarea = ({ name, rows = 3, ...props }: ConNombre<'textarea'>) => (
  <textarea id={name} name={name} rows={rows} aria-invalid={useErrorDe(name) ? true : undefined} className={CLASES_CONTROL} {...props} />
)

// Fila de varios campos en desktop, uno abajo del otro en mobile
export const FilaCampos = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 gap-4 sm:auto-cols-fr sm:grid-flow-col">{children}</div>
)
