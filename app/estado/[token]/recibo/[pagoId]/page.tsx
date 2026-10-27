import { notFound } from 'next/navigation'
import { BarraDocumento } from '@/components/documentos/BarraDocumento'
import { Recibo } from '@/components/documentos/Recibo'
import { idiomaPara } from '@/lib/documentos/idioma'
import { obtenerEstadoPublico } from '@/lib/publico'

// Solo recibos de pagos que pertenecen al cliente del link
export default async function ReciboPublicoPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string; pagoId: string }>
  searchParams: Promise<{ idioma?: string }>
}) {
  const [{ token, pagoId }, { idioma: pedido }] = await Promise.all([params, searchParams])
  const datos = await obtenerEstadoPublico(token)
  const pago = datos?.pagos.find((p) => Number(p.id) === Number(pagoId))
  if (!datos || !pago) notFound()

  const proyecto = datos.proyectos.find((p) => Number(p.id) === Number(pago.proyectoId)) ?? null
  const idioma = idiomaPara(datos.cliente.pais, pedido)

  return (
    <>
      <BarraDocumento idioma={idioma} volverHref={`/estado/${token}?idioma=${idioma}`} />
      <Recibo pago={pago} proyecto={proyecto} cliente={datos.cliente} idioma={idioma} />
    </>
  )
}
