'use client'

import { Campo, FilaCampos, Formulario, Input, Select, Textarea } from '@/components/ui/Formulario'
import { aInputFecha } from '@/lib/format'
import type { AccionFormulario } from '@/lib/formularios'
import { MEDIO_PAGO_POR_DEFECTO, MEDIOS_PAGO, MONEDA_POR_DEFECTO, MONEDAS, type PagoRow, type ProyectoRow } from '@/lib/types'

interface PagoFormProps {
  accion: AccionFormulario
  textoBoton: string
  proyectos: ProyectoRow[]
  pago?: PagoRow
  proyectoIdInicial?: string
}

export const PagoForm = ({ accion, textoBoton, proyectos, pago, proyectoIdInicial }: PagoFormProps) => (
  <Formulario accion={accion} textoBoton={textoBoton}>
    <Campo nombre="proyecto_id" label="Proyecto *">
      <Select name="proyecto_id" required defaultValue={pago?.proyectoId ?? proyectoIdInicial ?? ''}>
        <option value="" disabled>Seleccioná un proyecto</option>
        {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.clienteNombre})</option>)}
      </Select>
    </Campo>

    <FilaCampos>
      <Campo nombre="fecha" label="Fecha *">
        <Input name="fecha" type="date" required defaultValue={aInputFecha(pago?.fecha)} />
      </Campo>
      <Campo nombre="monto" label="Monto *">
        <Input name="monto" type="number" step="0.01" min="0" required defaultValue={pago?.monto} placeholder="0.00" />
      </Campo>
      <Campo nombre="moneda" label="Moneda">
        <Select name="moneda" defaultValue={pago?.moneda ?? MONEDA_POR_DEFECTO}>
          {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>
      </Campo>
    </FilaCampos>

    <Campo nombre="medio_pago" label="Medio de pago">
      <Select name="medio_pago" defaultValue={pago?.medioPago ?? MEDIO_PAGO_POR_DEFECTO}>
        {MEDIOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
      </Select>
    </Campo>

    <Campo nombre="notas" label="Notas adicionales">
      <Textarea name="notas" defaultValue={pago?.notas ?? ''} placeholder="Opcional" />
    </Campo>
  </Formulario>
)
