'use client'

import { Campo, FilaCampos, Formulario, Input, Select } from '@/components/ui/Formulario'
import { aInputFecha } from '@/lib/format'
import type { AccionFormulario } from '@/lib/formularios'
import {
  FRECUENCIAS_PAGO,
  MEDIO_PAGO_POR_DEFECTO,
  MEDIOS_PAGO,
  MONEDA_POR_DEFECTO,
  MONEDAS,
  type CostoRow,
} from '@/lib/types'

interface CostoFormProps {
  accion: AccionFormulario
  textoBoton: string
  costo?: CostoRow
}

export const CostoForm = ({ accion, textoBoton, costo }: CostoFormProps) => (
  <Formulario accion={accion} textoBoton={textoBoton}>
    <Campo nombre="nombre_costo" label="Nombre del costo *">
      <Input name="nombre_costo" type="text" required defaultValue={costo?.nombreCosto} placeholder="Ej: Figma, hosting, dominio" />
    </Campo>

    <FilaCampos>
      <Campo nombre="monto" label="Monto *">
        <Input name="monto" type="number" step="0.01" min="0" required defaultValue={costo?.monto} placeholder="0.00" />
      </Campo>
      <Campo nombre="moneda" label="Moneda">
        <Select name="moneda" defaultValue={costo?.moneda ?? MONEDA_POR_DEFECTO}>
          {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>
      </Campo>
      <Campo nombre="frecuencia" label="Frecuencia">
        <Select name="frecuencia" defaultValue={costo?.frecuencia ?? 'MENSUAL'}>
          {FRECUENCIAS_PAGO.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </Select>
      </Campo>
    </FilaCampos>

    <FilaCampos>
      <Campo nombre="metodo_pago" label="Método de pago">
        <Select name="metodo_pago" defaultValue={costo?.metodoPago ?? MEDIO_PAGO_POR_DEFECTO}>
          {MEDIOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>
      </Campo>
      <Campo nombre="fecha_renovacion" label="Fecha de renovación">
        <Input name="fecha_renovacion" type="date" defaultValue={aInputFecha(costo?.fechaRenovacion)} />
      </Campo>
    </FilaCampos>

    <FilaCampos>
      <Campo nombre="fecha_inicio" label="Fecha de alta">
        <Input name="fecha_inicio" type="date" defaultValue={aInputFecha(costo?.fechaInicio)} />
      </Campo>
      <Campo nombre="fecha_baja" label="Fecha de baja" ayuda="Vacío = sigue activo">
        <Input name="fecha_baja" type="date" defaultValue={aInputFecha(costo?.fechaBaja)} />
      </Campo>
    </FilaCampos>
  </Formulario>
)
