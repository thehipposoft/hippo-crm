import { PropuestaForm } from '@/components/propuestas/PropuestaForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { datosFormPropuesta } from '@/lib/propuestasServer'
import { TIPO_PROPUESTA_VALUES } from '@/lib/types'
import { crearPropuesta } from '../actions'

export default async function NuevaPropuestaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; cliente?: string; plantilla?: string }>
}) {
  const [{ tipo, cliente, plantilla }, datos] = await Promise.all([searchParams, datosFormPropuesta()])
  const tipoInicial = TIPO_PROPUESTA_VALUES.find((t) => t === tipo) ?? 'PROPUESTA'

  return (
    <PaginaFormulario
      titulo={tipoInicial === 'PROPUESTA' ? 'Nueva propuesta' : 'Nueva cotización'}
      volverHref="/propuestas"
      volverLabel="Volver a propuestas"
      ancho
    >
      <PropuestaForm
        accion={crearPropuesta}
        textoBoton="Guardar borrador"
        {...datos}
        inicial={{ tipo: tipoInicial, clienteId: cliente, plantilla }}
      />
    </PaginaFormulario>
  )
}
