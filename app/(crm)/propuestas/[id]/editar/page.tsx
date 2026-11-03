import { PropuestaForm } from '@/components/propuestas/PropuestaForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { numeroPropuesta } from '@/lib/propuestas'
import { datosFormPropuesta } from '@/lib/propuestasServer'
import type { PropuestaRow } from '@/lib/types'
import { wpGetONotFound } from '@/lib/wp'
import { actualizarPropuesta } from '../../actions'

export default async function EditarPropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [propuesta, datos] = await Promise.all([
    wpGetONotFound<PropuestaRow>(`/propuestas/${id}`),
    datosFormPropuesta(),
  ])

  return (
    <PaginaFormulario titulo={`Editar ${numeroPropuesta(propuesta)}`} volverHref={`/propuestas/${id}`} volverLabel="Volver" ancho>
      <PropuestaForm accion={actualizarPropuesta.bind(null, id)} textoBoton="Guardar cambios" propuesta={propuesta} {...datos} plantillas={[]} />
    </PaginaFormulario>
  )
}
