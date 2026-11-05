import { FormOlvidePortal } from '@/components/portal/FormulariosAcceso'
import { PantallaAcceso } from '@/components/portal/PantallaAcceso'
import { esIdioma } from '@/lib/documentos/idioma'
import { TEXTOS_PORTAL } from '@/lib/portal/textos'

export default async function PortalOlvidePage({ searchParams }: { searchParams: Promise<{ idioma?: string }> }) {
  const { idioma: pedido } = await searchParams
  const idioma = esIdioma(pedido) ? pedido : 'es'
  const t = TEXTOS_PORTAL[idioma]
  return (
    <PantallaAcceso idioma={idioma} titulo={t.recuperar} ayuda={t.recuperarAyuda} rutaIdioma="/portal/olvide">
      <FormOlvidePortal idioma={idioma} />
    </PantallaAcceso>
  )
}
