import { CostoForm } from '@/components/costos/CostoForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import type { CostoRow } from '@/lib/types'
import { wpGetONotFound } from '@/lib/wp'
import { actualizarCosto } from './actions'

export default async function EditarCostoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const costo = await wpGetONotFound<CostoRow>(`/costos/${id}`)

  return (
    <PaginaFormulario titulo="Editar costo" volverHref={`/costos/${id}`} volverLabel="Volver al costo">
      <CostoForm accion={actualizarCosto.bind(null, id)} textoBoton="Guardar cambios" costo={costo} />
    </PaginaFormulario>
  )
}
