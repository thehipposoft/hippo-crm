'use client'

import { useState } from 'react'
import { Campo, FilaCampos, Formulario, Input, Select, Textarea } from '@/components/ui/Formulario'
import { aInputFecha } from '@/lib/format'
import type { AccionFormulario } from '@/lib/formularios'
import type { SugerenciaPago } from '@/lib/proyectos'
import {
  MEDIO_PAGO_POR_DEFECTO,
  MEDIOS_PAGO,
  MONEDA_POR_DEFECTO,
  MONEDAS,
  type Moneda,
  type PagoRow,
  type ProyectoRow,
} from '@/lib/types'

const AYUDA_ORIGEN: Record<NonNullable<SugerenciaPago['origen']>, string> = {
  CUOTA: 'Sugerido: una cuota del proyecto',
  SALDO: 'Sugerido: el saldo pendiente',
}

interface PagoFormProps {
  accion: AccionFormulario
  textoBoton: string
  proyectos: ProyectoRow[]
  pago?: PagoRow
  proyectoIdInicial?: string
  // Solo en el alta: moneda y monto sugeridos por proyecto
  sugerencias?: Record<number, SugerenciaPago>
  fechaPorDefecto?: string
  // A dónde volver después de guardar
  volver?: string
}

export const PagoForm = ({
  accion,
  textoBoton,
  proyectos,
  pago,
  proyectoIdInicial,
  sugerencias,
  fechaPorDefecto,
  volver,
}: PagoFormProps) => {
  const sugerenciaDe = (id: string): SugerenciaPago | undefined => (pago ? undefined : sugerencias?.[Number(id)])

  const [proyectoId, setProyectoId] = useState(String(pago?.proyectoId ?? proyectoIdInicial ?? ''))
  const inicial = sugerenciaDe(proyectoId)
  const [moneda, setMoneda] = useState<Moneda>(pago?.moneda ?? inicial?.moneda ?? MONEDA_POR_DEFECTO)
  const [monto, setMonto] = useState(pago ? String(pago.monto) : (inicial?.monto?.toString() ?? ''))
  const [origen, setOrigen] = useState(inicial?.origen ?? null)

  const cambiarProyecto = (id: string) => {
    setProyectoId(id)
    const sugerencia = sugerenciaDe(id)
    if (!sugerencia) return
    setMoneda(sugerencia.moneda)
    setMonto(sugerencia.monto?.toString() ?? '')
    setOrigen(sugerencia.origen)
  }

  return (
    <Formulario accion={accion} textoBoton={textoBoton}>
      {volver && <input type="hidden" name="volver" value={volver} />}

      <Campo nombre="proyecto_id" label="Proyecto *">
        <Select name="proyecto_id" required value={proyectoId} onChange={(e) => cambiarProyecto(e.target.value)}>
          <option value="" disabled>Seleccioná un proyecto</option>
          {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.clienteNombre})</option>)}
        </Select>
      </Campo>

      <FilaCampos>
        <Campo nombre="fecha" label="Fecha *">
          <Input name="fecha" type="date" required defaultValue={aInputFecha(pago?.fecha) || fechaPorDefecto} />
        </Campo>
        <Campo nombre="monto" label="Monto *" ayuda={origen ? AYUDA_ORIGEN[origen] : undefined}>
          <Input
            name="monto"
            type="number"
            step="0.01"
            min="0"
            required
            value={monto}
            onChange={(e) => {
              setMonto(e.target.value)
              setOrigen(null)
            }}
            placeholder="0.00"
          />
        </Campo>
        <Campo nombre="moneda" label="Moneda">
          <Select name="moneda" value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)}>
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
}
