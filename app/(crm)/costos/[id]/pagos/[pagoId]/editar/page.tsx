import { notFound } from 'next/navigation'
import { PagoCostoForm } from '@/components/costos/PagoCostoForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { aIso, hoy } from '@/lib/fechas'
import { opcionesFormPagoCosto } from '@/lib/pagosCosto'
import type { CostoRow } from '@/lib/types'
import { wpGetONotFound } from '@/lib/wp'
import { actualizarPagoCosto } from '../../actions'

export default async function EditarPagoCostoPage({ params }: { params: Promise<{ id: string; pagoId: string }> }) {
  const { id, pagoId } = await params
  const costo = await wpGetONotFound<CostoRow>(`/costos/${id}`)
  const pago = costo.pagos?.find((p) => String(p.id) === pagoId)
  if (!pago) notFound()

  const fechaHoy = hoy()
  const opciones = opcionesFormPagoCosto(costo, fechaHoy, { excluirPagoId: pago.id, incluir: pago.periodo ?? undefined })

  return (
    <PaginaFormulario titulo={`Editar pago · ${costo.nombreCosto}`} volverHref={`/costos/${id}`} volverLabel="Volver al costo">
      <PagoCostoForm
        accion={actualizarPagoCosto.bind(null, id, pagoId)}
        textoBoton="Guardar cambios"
        opciones={opciones}
        periodoInicial={pago.periodo ?? opciones[0].periodo}
        monedaInicial={pago.moneda}
        metodoInicial={pago.metodoPago}
        fechaPorDefecto={aIso(fechaHoy)}
        pago={pago}
      />
    </PaginaFormulario>
  )
}
