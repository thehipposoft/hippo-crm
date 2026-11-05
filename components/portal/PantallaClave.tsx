import Link from 'next/link'
import type { Idioma } from '@/lib/documentos/idioma'
import { TEXTOS_PORTAL } from '@/lib/portal/textos'
import { wpPublico } from '@/lib/wp'
import { FormClavePortal } from './FormulariosAcceso'
import { PantallaAcceso } from './PantallaAcceso'

type InfoToken = { nombre: string; email: string; cliente: string | null; idioma: Idioma }

const PATRON_TOKEN = /^[a-f0-9]{64}$/

// Crear contraseña (invitación) o elegir una nueva (olvidé): primero valida el link
export const PantallaClave = async ({ tipo, token }: { tipo: 'invitacion' | 'reset'; token: string | undefined }) => {
  const consulta = token && PATRON_TOKEN.test(token) ? await wpPublico<InfoToken>(`/portal/token?tipo=${tipo}&token=${token}`) : null
  const info = consulta?.status === 200 ? consulta.datos : null

  if (!info || !token) {
    const t = TEXTOS_PORTAL.es
    return (
      <PantallaAcceso idioma="es" titulo={t.linkInvalido} ayuda={t.linkInvalidoAyuda}>
        <div className="flex flex-col gap-2 text-center text-sm">
          <Link href="/portal/olvide" className="rounded-lg bg-dark-text px-4 py-2.5 font-semibold text-white transition hover:bg-dark-text/85">
            {t.olvide}
          </Link>
          <Link href="/portal" className="text-dark-text/60 hover:text-dark-text">
            {t.volverIngresar}
          </Link>
        </div>
      </PantallaAcceso>
    )
  }

  const t = TEXTOS_PORTAL[info.idioma]
  return (
    <PantallaAcceso
      idioma={info.idioma}
      titulo={tipo === 'invitacion' ? t.crearClave : t.nuevaClave}
      ayuda={
        <>
          {t.bienvenida(info.nombre)}. {tipo === 'invitacion' && t.crearClaveAyuda(info.cliente)}
          <span className="mt-1 block text-xs text-dark-text/40">{info.email}</span>
        </>
      }
    >
      <FormClavePortal tipo={tipo} token={token} idioma={info.idioma} email={info.email} />
    </PantallaAcceso>
  )
}
