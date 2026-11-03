import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { BarraDocumento } from '@/components/documentos/BarraDocumento'
import { PropuestaDocumento } from '@/components/documentos/PropuestaDocumento'
import { RespuestaPropuesta } from '@/components/documentos/RespuestaPropuesta'
import { TEXTOS_PROPUESTA } from '@/lib/documentos/textosPropuesta'
import { TOKEN_COOKIE } from '@/lib/cookies'
import { obtenerPropuestaPublica } from '@/lib/publico'

type Props = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const propuesta = await obtenerPropuestaPublica(token, false)
  if (!propuesta) return {}
  return { title: `${TEXTOS_PROPUESTA[propuesta.idioma][propuesta.tipo]}: ${propuesta.titulo} · Hippo` }
}

export default async function PropuestaPublicaPage({ params }: Props) {
  const { token } = await params
  // Si la abre alguien del equipo (tiene sesión del CRM) no cuenta como "vista por el cliente"
  const esEquipo = (await cookies()).has(TOKEN_COOKIE)
  const propuesta = await obtenerPropuestaPublica(token, !esEquipo)
  if (!propuesta) notFound()

  return (
    <>
      <BarraDocumento idioma={propuesta.idioma} sinIdioma />
      <PropuestaDocumento propuesta={propuesta} respuesta={<RespuestaPropuesta token={token} propuesta={propuesta} />} />
    </>
  )
}
