import { notFound } from 'next/navigation'
import { BarraDocumento } from '@/components/documentos/BarraDocumento'
import { EstadoDeCuentaDoc } from '@/components/documentos/EstadoDeCuentaDoc'
import { armarEstadoDeCuenta } from '@/lib/documentos/estadoDeCuenta'
import { idiomaPara } from '@/lib/documentos/idioma'
import { hoy } from '@/lib/fechas'
import { obtenerEstadoPublico } from '@/lib/publico'

export default async function EstadoPublicoPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ idioma?: string }>
}) {
  const [{ token }, { idioma: pedido }] = await Promise.all([params, searchParams])
  const datos = await obtenerEstadoPublico(token)
  if (!datos) notFound()

  const fechaHoy = hoy()
  const idioma = idiomaPara(datos.cliente.pais, pedido)

  return (
    <>
      <BarraDocumento idioma={idioma} />
      <EstadoDeCuentaDoc
        cliente={datos.cliente}
        estado={armarEstadoDeCuenta(datos.proyectos, datos.pagos, fechaHoy)}
        idioma={idioma}
        fechaEmision={fechaHoy}
        hrefRecibo={(pagoId) => `/estado/${token}/recibo/${pagoId}?idioma=${idioma}`}
      />
    </>
  )
}
