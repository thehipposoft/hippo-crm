'use client'

import { Campo, FilaCampos, Formulario, Input, Textarea } from '@/components/ui/Formulario'
import type { AccionFormulario } from '@/lib/formularios'

interface UnidadesNuevasFormProps {
  accion: AccionFormulario
  unidad: string
  fechaPorDefecto: string
}

export const UnidadesNuevasForm = ({ accion, unidad, fechaPorDefecto }: UnidadesNuevasFormProps) => (
  <Formulario accion={accion} textoBoton={`Agregar ${unidad}s`}>
    <Campo nombre="nombres" label={`${unidad[0].toUpperCase()}${unidad.slice(1)}s *`} ayuda="Una por línea. Podés pegar una lista.">
      <Textarea name="nombres" rows={6} required placeholder={'ana@cliente.com\njuan@cliente.com'} />
    </Campo>
    <FilaCampos>
      <Campo nombre="fecha_alta" label="Fecha de alta *" ayuda="El mes del alta se cobra completo">
        <Input name="fecha_alta" type="date" required defaultValue={fechaPorDefecto} />
      </Campo>
    </FilaCampos>
    <Campo nombre="notas" label="Notas">
      <Textarea name="notas" rows={2} placeholder="Opcional — internas, el cliente no las ve" />
    </Campo>
  </Formulario>
)
