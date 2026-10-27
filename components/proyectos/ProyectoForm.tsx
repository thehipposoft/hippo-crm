'use client'

import { useState } from 'react'
import { Campo, FilaCampos, Formulario, Input, Select, Textarea } from '@/components/ui/Formulario'
import { aInputFecha } from '@/lib/format'
import type { AccionFormulario } from '@/lib/formularios'
import {
  ESTADOS,
  FRECUENCIAS_PAGO,
  MONEDA_POR_DEFECTO,
  MONEDAS,
  TIPOS_PROYECTO,
  type ClienteRow,
  type Moneda,
  type ProyectoRow,
  type TipoProyecto,
} from '@/lib/types'

interface ProyectoFormProps {
  accion: AccionFormulario
  textoBoton: string
  clientes: ClienteRow[]
  proyecto?: ProyectoRow
  // Proyectos viejos sin moneda: se propone la de sus pagos
  monedaInicial?: Moneda
}

export const ProyectoForm = ({ accion, textoBoton, clientes, proyecto, monedaInicial }: ProyectoFormProps) => {
  const [tipoProyecto, setTipoProyecto] = useState<TipoProyecto>(proyecto?.tipoProyecto ?? 'ON_OFF')

  return (
    <Formulario accion={accion} textoBoton={textoBoton}>
      <Campo nombre="nombre" label="Nombre *">
        <Input name="nombre" type="text" required defaultValue={proyecto?.nombre} placeholder="Nombre del proyecto" />
      </Campo>

      <Campo nombre="cliente_id" label="Cliente *">
        <Select name="cliente_id" required defaultValue={proyecto?.clienteId ?? ''}>
          <option value="" disabled>Seleccioná un cliente</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </Select>
      </Campo>

      <Campo nombre="estado" label="Estado">
        <Select name="estado" defaultValue={proyecto?.estado ?? 'PROSPECTO'}>
          {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </Select>
      </Campo>

      <FilaCampos>
        <Campo nombre="fecha_inicio" label="Fecha de inicio">
          <Input name="fecha_inicio" type="date" defaultValue={aInputFecha(proyecto?.fechaInicio)} />
        </Campo>
        <Campo nombre="deadline" label="Deadline">
          <Input name="deadline" type="date" defaultValue={aInputFecha(proyecto?.deadline)} />
        </Campo>
      </FilaCampos>

      <FilaCampos>
        <Campo nombre="tipo_proyecto" label="Tipo de proyecto">
          <Select
            name="tipo_proyecto"
            value={tipoProyecto}
            onChange={(e) => setTipoProyecto(e.target.value as TipoProyecto)}
          >
            {TIPOS_PROYECTO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </Campo>
        {tipoProyecto === 'RECURRENTE' && (
          <Campo nombre="frecuencia_pago" label="Frecuencia de pago">
            <Select name="frecuencia_pago" defaultValue={proyecto?.frecuenciaPago ?? 'MENSUAL'}>
              {FRECUENCIAS_PAGO.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </Select>
          </Campo>
        )}
      </FilaCampos>

      <FilaCampos>
        <Campo nombre="valor" label={tipoProyecto === 'RECURRENTE' ? 'Valor por período' : 'Valor'}>
          <Input name="valor" type="number" step="0.01" min="0" defaultValue={proyecto?.valor} placeholder="0.00" />
        </Campo>
        <Campo nombre="moneda" label="Moneda">
          <Select name="moneda" defaultValue={monedaInicial ?? proyecto?.moneda ?? MONEDA_POR_DEFECTO}>
            {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </Campo>
      </FilaCampos>

      <Campo nombre="url" label="URL">
        <Input name="url" type="url" defaultValue={proyecto?.url ?? ''} placeholder="Opcional" />
      </Campo>

      <Campo nombre="accion_pendiente" label="Acción pendiente">
        <Textarea
          name="accion_pendiente"
          defaultValue={proyecto?.accionPendiente ?? ''}
          placeholder="Opcional — qué falta hacer con este proyecto"
        />
      </Campo>
    </Formulario>
  )
}
