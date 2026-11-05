'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { definirClavePortal, iniciarSesionPortal, olvideClavePortal, type ErrorPortal } from '@/app/portal/actions'
import { CLASES_CONTROL } from '@/components/ui/Formulario'
import type { Idioma } from '@/lib/documentos/idioma'
import { MIN_CLAVE } from '@/lib/portal/portal'
import { TEXTOS_PORTAL } from '@/lib/portal/textos'

const BOTON =
  'w-full rounded-lg bg-dark-text px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dark-text/85 disabled:cursor-not-allowed disabled:opacity-50'

const Campo = ({ id, label, ayuda, children }: { id: string; label: string; ayuda?: string; children: React.ReactNode }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-dark-text/60">
      {label}
    </label>
    {children}
    {ayuda && <p className="mt-1 text-xs text-dark-text/40">{ayuda}</p>}
  </div>
)

const MensajeError = ({ children }: { children: React.ReactNode }) => (
  <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
    {children}
  </p>
)

const mensajeError = (error: ErrorPortal, idioma: Idioma): string => {
  const t = TEXTOS_PORTAL[idioma]
  const mensajes: Record<ErrorPortal, string> = {
    CREDENCIALES: t.errorCredenciales,
    BLOQUEADO: t.errorBloqueado,
    DESACTIVADO: t.errorDesactivado,
    CONEXION: t.errorConexion,
    LINK_INVALIDO: t.linkInvalido,
    CLAVE_CORTA: t.minimo(MIN_CLAVE),
  }
  return mensajes[error]
}

export const FormLoginPortal = ({ idioma }: { idioma: Idioma }) => {
  const t = TEXTOS_PORTAL[idioma]
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState<ErrorPortal | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        startTransition(async () => {
          const resultado = await iniciarSesionPortal(email, clave)
          setError(resultado.error)
        })
      }}
    >
      <Campo id="email" label={t.email}>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={CLASES_CONTROL} />
      </Campo>
      <Campo id="clave" label={t.contrasena}>
        <input id="clave" type="password" required autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} className={CLASES_CONTROL} />
      </Campo>
      {error && <MensajeError>{mensajeError(error, idioma)}</MensajeError>}
      <button type="submit" disabled={pending} className={BOTON}>
        {pending ? t.ingresando : t.ingresar}
      </button>
      <div className="flex flex-col items-center gap-1 pt-1 text-xs">
        <Link href={`/portal/olvide?idioma=${idioma}`} className="font-medium text-dark-text underline decoration-brand-blue decoration-2 underline-offset-2">
          {t.olvide}
        </Link>
        <p className="text-dark-text/40">{t.sinAcceso}</p>
      </div>
    </form>
  )
}

export const FormClavePortal = ({ tipo, token, idioma, email }: { tipo: 'invitacion' | 'reset'; token: string; idioma: Idioma; email: string }) => {
  const t = TEXTOS_PORTAL[idioma]
  const [clave, setClave] = useState('')
  const [repetida, setRepetida] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (clave !== repetida) return setError(t.noCoinciden)
        setError(null)
        startTransition(async () => {
          const resultado = await definirClavePortal(tipo, token, clave)
          setError(mensajeError(resultado.error, idioma))
        })
      }}
    >
      {/* Para que el gestor de contraseñas la guarde con el email correcto */}
      <input type="email" autoComplete="username" value={email} readOnly hidden />
      <Campo id="clave" label={t.clave} ayuda={t.minimo(MIN_CLAVE)}>
        <input id="clave" type="password" required minLength={MIN_CLAVE} autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} className={CLASES_CONTROL} />
      </Campo>
      <Campo id="repetida" label={t.repetirClave}>
        <input id="repetida" type="password" required minLength={MIN_CLAVE} autoComplete="new-password" value={repetida} onChange={(e) => setRepetida(e.target.value)} className={CLASES_CONTROL} />
      </Campo>
      {error && <MensajeError>{error}</MensajeError>}
      <button type="submit" disabled={pending} className={BOTON}>
        {pending ? t.guardando : t.guardarYEntrar}
      </button>
    </form>
  )
}

export const FormOlvidePortal = ({ idioma }: { idioma: Idioma }) => {
  const t = TEXTOS_PORTAL[idioma]
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState(false)
  const [pending, startTransition] = useTransition()

  if (enviado) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-brand-white px-3 py-3 text-sm text-dark-text/80">{t.revisaEmail}</p>
        <Link href={`/portal?idioma=${idioma}`} className={`${BOTON} block text-center`}>
          {t.volverIngresar}
        </Link>
      </div>
    )
  }
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        setError(false)
        startTransition(async () => {
          const { ok } = await olvideClavePortal(email)
          if (ok) setEnviado(true)
          else setError(true)
        })
      }}
    >
      <Campo id="email" label={t.email}>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={CLASES_CONTROL} />
      </Campo>
      {error && <MensajeError>{t.errorConexion}</MensajeError>}
      <button type="submit" disabled={pending} className={BOTON}>
        {pending ? t.enviando : t.enviarLink}
      </button>
      <p className="text-center text-xs">
        <Link href={`/portal?idioma=${idioma}`} className="text-dark-text/60 hover:text-dark-text">
          {t.volverIngresar}
        </Link>
      </p>
    </form>
  )
}
