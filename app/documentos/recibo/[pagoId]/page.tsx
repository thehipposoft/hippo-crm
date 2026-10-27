import { BarraDocumento } from '@/components/documentos/BarraDocumento'
import { Recibo } from '@/components/documentos/Recibo'
import { idiomaPara, numeroRecibo } from '@/lib/documentos/idioma'
import type { ClienteRow, PagoRow, ProyectoRow } from '@/lib/types'
import { wpGet, wpGetONotFound } from '@/lib/wp'

const opcional = async <T,>(promesa: Promise<T>): Promise<T | null> => promesa.catch(() => null)

export const generateMetadata = async ({ params }: { params: Promise<{ pagoId: string }> }) => ({
  title: `Recibo ${numeroRecibo(Number((await params).pagoId))}`,
})

export default async function ReciboPage({
  params,
  searchParams,
}: {
  params: Promise<{ pagoId: string }>
  searchParams: Promise<{ idioma?: string }>
}) {
  const [{ pagoId }, { idioma: pedido }] = await Promise.all([params, searchParams])
  const pago = await wpGetONotFound<PagoRow>(`/pagos/${pagoId}`)
  const proyecto = await opcional(wpGet<ProyectoRow>(`/proyectos/${pago.proyectoId}`))
  const cliente = proyecto ? await opcional(wpGet<ClienteRow>(`/clientes/${proyecto.clienteId}`)) : null
  const idioma = idiomaPara(cliente?.pais, pedido)

  return (
    <>
      <BarraDocumento idioma={idioma} volverHref={`/pagos/${pago.id}`} />
      <Recibo pago={pago} proyecto={proyecto} cliente={cliente} idioma={idioma} />
    </>
  )
}
