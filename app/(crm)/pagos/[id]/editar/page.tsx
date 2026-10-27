import { PagoForm } from '@/components/pagos/PagoForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import type { PagoRow, ProyectoRow } from '@/lib/types'
import { wpGet, wpGetONotFound } from '@/lib/wp'
import { actualizarPago } from './actions'

export default async function EditarPagoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [pago, proyectos] = await Promise.all([
    wpGetONotFound<PagoRow>(`/pagos/${id}`),
    wpGet<ProyectoRow[]>('/proyectos'),
  ])

  return (
    <PaginaFormulario titulo="Editar pago" volverHref={`/pagos/${id}`} volverLabel="Volver al pago">
      <PagoForm accion={actualizarPago.bind(null, id)} textoBoton="Guardar cambios" proyectos={proyectos} pago={pago} />
    </PaginaFormulario>
  )
}
