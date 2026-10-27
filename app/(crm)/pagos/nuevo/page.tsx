import { PagoForm } from '@/components/pagos/PagoForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import type { ProyectoRow } from '@/lib/types'
import { wpGet } from '@/lib/wp'
import { crearPago } from './actions'

export default async function NuevoPagoPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto } = await searchParams
  const proyectos = await wpGet<ProyectoRow[]>('/proyectos')

  return (
    <PaginaFormulario titulo="Nuevo pago" volverHref="/pagos" volverLabel="Volver a pagos">
      <PagoForm accion={crearPago} textoBoton="Guardar pago" proyectos={proyectos} proyectoIdInicial={proyecto} />
    </PaginaFormulario>
  )
}
