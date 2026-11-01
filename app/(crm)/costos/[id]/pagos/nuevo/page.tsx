import { PagoCostoForm } from '@/components/costos/PagoCostoForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { sugerenciaPagoCosto } from '@/lib/costos'
import { aIso, hoy } from '@/lib/fechas'
import { destinoSeguro } from '@/lib/formularios'
import { opcionesFormPagoCosto } from '@/lib/pagosCosto'
import type { CostoRow } from '@/lib/types'
import { wpGetONotFound } from '@/lib/wp'
import { crearPagoCosto } from '../actions'

export default async function NuevoPagoCostoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ periodo?: string; volver?: string }>
}) {
  const [{ id }, { periodo, volver }] = await Promise.all([params, searchParams])
  const costo = await wpGetONotFound<CostoRow>(`/costos/${id}`)

  const fechaHoy = hoy()
  const opciones = opcionesFormPagoCosto(costo, fechaHoy)
  const sugerencia = sugerenciaPagoCosto(costo, fechaHoy)
  const periodoInicial = opciones.some((o) => o.periodo === periodo) ? (periodo as string) : sugerencia.periodo
  const destino = destinoSeguro(volver, `/costos/${id}`)

  return (
    <PaginaFormulario titulo={`Registrar pago · ${costo.nombreCosto}`} volverHref={destino} volverLabel="Volver">
      <PagoCostoForm
        accion={crearPagoCosto.bind(null, id)}
        textoBoton="Guardar pago"
        opciones={opciones}
        periodoInicial={periodoInicial}
        monedaInicial={costo.moneda}
        metodoInicial={costo.metodoPago}
        fechaPorDefecto={aIso(fechaHoy)}
        volver={destino}
      />
    </PaginaFormulario>
  )
}
