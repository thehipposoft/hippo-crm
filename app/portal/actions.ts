'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { PORTAL_COOKIE, PORTAL_MAX_AGE_SECONDS } from '@/lib/cookies'
import { MIN_CLAVE } from '@/lib/portal/portal'
import { wpPublico } from '@/lib/wp'

type Sesion = { token: string; nombre: string; cliente: string | null }

export type ErrorPortal = 'CREDENCIALES' | 'BLOQUEADO' | 'DESACTIVADO' | 'CONEXION' | 'LINK_INVALIDO' | 'CLAVE_CORTA'

const guardarSesion = async (token: string) => {
  ;(await cookies()).set(PORTAL_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PORTAL_MAX_AGE_SECONDS,
    path: '/',
  })
}

const STATUS_BLOQUEADO = 429
const STATUS_DESACTIVADO = 403

export async function iniciarSesionPortal(email: string, password: string): Promise<{ error: ErrorPortal }> {
  if (!email.trim() || !password) return { error: 'CREDENCIALES' }
  const { status, datos } = await wpPublico<Sesion>('/portal/login', { method: 'POST', body: { email, password } })
  if (status === 200 && datos?.token) {
    await guardarSesion(datos.token)
    redirect('/portal/cuenta')
  }
  if (status === STATUS_BLOQUEADO) return { error: 'BLOQUEADO' }
  if (status === STATUS_DESACTIVADO) return { error: 'DESACTIVADO' }
  if (status === null || status >= 500) return { error: 'CONEXION' }
  return { error: 'CREDENCIALES' }
}

const PATRON_TOKEN = /^[a-f0-9]{64}$/

// Crear contraseña (invitación) o cambiarla (olvidé): deja la sesión iniciada
export async function definirClavePortal(tipo: 'invitacion' | 'reset', token: string, password: string): Promise<{ error: ErrorPortal }> {
  if (!PATRON_TOKEN.test(token)) return { error: 'LINK_INVALIDO' }
  if (!z.string().min(MIN_CLAVE).safeParse(password).success) return { error: 'CLAVE_CORTA' }
  const { status, datos } = await wpPublico<Sesion>('/portal/clave', { method: 'POST', body: { tipo, token, password } })
  if (status === 200 && datos?.token) {
    await guardarSesion(datos.token)
    redirect('/portal/cuenta')
  }
  if (status === 404) return { error: 'LINK_INVALIDO' }
  if (status === 400) return { error: 'CLAVE_CORTA' }
  return { error: 'CONEXION' }
}

// Siempre "ok" para no revelar qué emails tienen acceso
export async function olvideClavePortal(email: string): Promise<{ ok: boolean }> {
  if (!z.email().safeParse(email.trim()).success) return { ok: false }
  const { status } = await wpPublico('/portal/olvide', { method: 'POST', body: { email: email.trim() } })
  return { ok: status === 200 }
}
