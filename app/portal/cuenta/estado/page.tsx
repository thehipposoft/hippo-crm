import { BarraDocumento } from '@/components/documentos/BarraDocumento'
import { EstadoDeCuentaDoc } from '@/components/documentos/EstadoDeCuentaDoc'
import { armarEstadoDeCuenta } from '@/lib/documentos/estadoDeCuenta'
import { idiomaPara } from '@/lib/documentos/idioma'
import { hoy } from '@/lib/fechas'
import { obtenerEstadoPortal } from '@/lib/portal/sesion'

// Estado de cuenta para imprimir / descargar en PDF
export default async function PortalEstadoPage({ searchParams }: { searchParams: Promise<{ idioma?: string }> }) {
  const [datos, { idioma: pedido }] = await Promise.all([obtenerEstadoPortal(), searchParams])
  const fechaHoy = hoy()
  const idioma = idiomaPara(datos.cliente.pais, pedido)

  return (
    <div className="py-6 print:py-0">
      <BarraDocumento idioma={idioma} volverHref="/portal/cuenta" />
      <EstadoDeCuentaDoc
        cliente={datos.cliente}
        estado={armarEstadoDeCuenta(datos.proyectos, datos.pagos, fechaHoy)}
        idioma={idioma}
        fechaEmision={fechaHoy}
        hrefRecibo={(pagoId) => `/portal/cuenta/recibo/${pagoId}?idioma=${idioma}`}
      />
    </div>
  )
}
