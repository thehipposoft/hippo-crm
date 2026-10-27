import { PagoForm } from '@/components/pagos/PagoForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { aIso, hoy } from '@/lib/fechas'
import { destinoSeguro } from '@/lib/formularios'
import { sugerenciaPago, type SugerenciaPago } from '@/lib/proyectos'
import type { PagoRow, ProyectoRow } from '@/lib/types'
import { wpGet } from '@/lib/wp'
import { crearPago } from './actions'

export default async function NuevoPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string; volver?: string }>
}) {
  const { proyecto, volver } = await searchParams
  const [proyectos, pagos] = await Promise.all([wpGet<ProyectoRow[]>('/proyectos'), wpGet<PagoRow[]>('/pagos')])

  const fechaHoy = hoy()
  const sugerencias: Record<number, SugerenciaPago> = {}
  for (const p of proyectos) sugerencias[p.id] = sugerenciaPago(p, pagos, fechaHoy)

  const destino = destinoSeguro(volver, '/pagos')

  return (
    <PaginaFormulario titulo="Nuevo pago" volverHref={destino} volverLabel="Volver">
      <PagoForm
        accion={crearPago}
        textoBoton="Guardar pago"
        proyectos={proyectos}
        proyectoIdInicial={proyecto}
        sugerencias={sugerencias}
        fechaPorDefecto={aIso(fechaHoy)}
        volver={destino}
      />
    </PaginaFormulario>
  )
}
