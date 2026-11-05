import { redirect } from 'next/navigation'
import { FormLoginPortal } from '@/components/portal/FormulariosAcceso'
import { PantallaAcceso } from '@/components/portal/PantallaAcceso'
import { esIdioma } from '@/lib/documentos/idioma'
import { getPortalToken } from '@/lib/portal/sesion'
import { TEXTOS_PORTAL } from '@/lib/portal/textos'

export default async function PortalLoginPage({ searchParams }: { searchParams: Promise<{ idioma?: string }> }) {
  if (await getPortalToken()) redirect('/portal/cuenta')
  const { idioma: pedido } = await searchParams
  const idioma = esIdioma(pedido) ? pedido : 'es'

  return (
    <PantallaAcceso idioma={idioma} titulo={TEXTOS_PORTAL[idioma].ingresar} rutaIdioma="/portal">
      <FormLoginPortal idioma={idioma} />
    </PantallaAcceso>
  )
}
