'use client'

import { Campo, FilaCampos, Formulario, Input, Textarea } from '@/components/ui/Formulario'
import { aInputFecha } from '@/lib/format'
import type { AccionFormulario } from '@/lib/formularios'
import type { UnidadRow } from '@/lib/types'

interface UnidadFormProps {
  accion: AccionFormulario
  unidad: UnidadRow
  etiqueta: string
}

export const UnidadForm = ({ accion, unidad, etiqueta }: UnidadFormProps) => (
  <Formulario accion={accion} textoBoton="Guardar cambios">
    <Campo nombre="nombre" label={`${etiqueta[0].toUpperCase()}${etiqueta.slice(1)} *`}>
      <Input name="nombre" type="text" required defaultValue={unidad.nombre} />
    </Campo>
    <FilaCampos>
      <Campo nombre="fecha_alta" label="Fecha de alta *">
        <Input name="fecha_alta" type="date" required defaultValue={aInputFecha(unidad.fechaAlta)} />
      </Campo>
      <Campo nombre="fecha_baja" label="Fecha de baja" ayuda="Vacío = activa">
        <Input name="fecha_baja" type="date" defaultValue={aInputFecha(unidad.fechaBaja)} />
      </Campo>
    </FilaCampos>
    <Campo nombre="notas" label="Notas">
      <Textarea name="notas" rows={2} defaultValue={unidad.notas ?? ''} placeholder="Opcional — internas" />
    </Campo>
  </Formulario>
)
