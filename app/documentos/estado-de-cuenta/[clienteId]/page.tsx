import { headers } from 'next/headers'
import { BarraDocumento } from '@/components/documentos/BarraDocumento'
import { EstadoDeCuentaDoc } from '@/components/documentos/EstadoDeCuentaDoc'
import { armarEstadoDeCuenta } from '@/lib/documentos/estadoDeCuenta'
import { idiomaPara } from '@/lib/documentos/idioma'
import { hoy } from '@/lib/fechas'
import type { ClienteRow, PagoRow, ProyectoRow } from '@/lib/types'
import { wpGet, wpGetONotFound } from '@/lib/wp'
import { LinkPublico } from './LinkPublico'

// URL absoluta del sitio actual (local o producción) para armar el link público
const origenActual = async (): Promise<string> => {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? ''
  const protocolo = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${protocolo}://${host}`
}

export const metadata = { title: 'Estado de cuenta' }

export default async function EstadoDeCuentaPage({
  params,
  searchParams,
}: {
  params: Promise<{ clienteId: string }>
  searchParams: Promise<{ idioma?: string }>
}) {
  const [{ clienteId }, { idioma: pedido }] = await Promise.all([params, searchParams])
  const cliente = await wpGetONotFound<ClienteRow>(`/clientes/${clienteId}`)
  const [proyectos, pagos, origen] = await Promise.all([
    wpGet<ProyectoRow[]>(`/clientes/${clienteId}/proyectos`),
    wpGet<PagoRow[]>('/pagos'),
    origenActual(),
  ])

  const fechaHoy = hoy()
  const idioma = idiomaPara(cliente.pais, pedido)
  const estado = armarEstadoDeCuenta(proyectos, pagos, fechaHoy)

  return (
    <>
      <BarraDocumento idioma={idioma} volverHref={`/clientes/${cliente.id}`} />
      <LinkPublico clienteId={cliente.id} url={cliente.tokenPublico ? `${origen}/estado/${cliente.tokenPublico}` : null} />
      <EstadoDeCuentaDoc
        cliente={cliente}
        estado={estado}
        idioma={idioma}
        fechaEmision={fechaHoy}
        hrefRecibo={(pagoId) => `/documentos/recibo/${pagoId}?idioma=${idioma}`}
      />
    </>
  )
}
