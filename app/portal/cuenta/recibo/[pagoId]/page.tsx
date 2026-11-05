import { notFound } from 'next/navigation'
import { BarraDocumento } from '@/components/documentos/BarraDocumento'
import { Recibo } from '@/components/documentos/Recibo'
import { idiomaPara } from '@/lib/documentos/idioma'
import { obtenerEstadoPortal } from '@/lib/portal/sesion'

// Solo recibos de pagos del cliente logueado
export default async function PortalReciboPage({
  params,
  searchParams,
}: {
  params: Promise<{ pagoId: string }>
  searchParams: Promise<{ idioma?: string }>
}) {
  const [{ pagoId }, { idioma: pedido }, datos] = await Promise.all([params, searchParams, obtenerEstadoPortal()])
  const pago = datos.pagos.find((p) => Number(p.id) === Number(pagoId))
  if (!pago) notFound()

  const proyecto = datos.proyectos.find((p) => Number(p.id) === Number(pago.proyectoId)) ?? null
  const idioma = idiomaPara(datos.cliente.pais, pedido)

  return (
    <div className="py-6 print:py-0">
      <BarraDocumento idioma={idioma} volverHref="/portal/cuenta" />
      <Recibo pago={pago} proyecto={proyecto} cliente={datos.cliente} idioma={idioma} />
    </div>
  )
}
