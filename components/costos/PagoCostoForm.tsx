'use client'

import { useState } from 'react'
import { Campo, FilaCampos, Formulario, Input, Select, Textarea } from '@/components/ui/Formulario'
import { aInputFecha } from '@/lib/format'
import type { AccionFormulario } from '@/lib/formularios'
import { MEDIO_PAGO_POR_DEFECTO, MEDIOS_PAGO, MONEDAS, type Moneda, type PagoCostoRow } from '@/lib/types'

export type OpcionPeriodo = {
  periodo: string
  label: string
  // Monto sugerido al elegirlo (lo que falta, o el esperado si ya está pago)
  montoSugerido: number
}

interface PagoCostoFormProps {
  accion: AccionFormulario
  textoBoton: string
  opciones: OpcionPeriodo[]
  periodoInicial: string
  monedaInicial: Moneda
  metodoInicial: string | null
  fechaPorDefecto: string
  pago?: PagoCostoRow
  volver?: string
}

export const PagoCostoForm = ({
  accion,
  textoBoton,
  opciones,
  periodoInicial,
  monedaInicial,
  metodoInicial,
  fechaPorDefecto,
  pago,
  volver,
}: PagoCostoFormProps) => {
  const sugeridoDe = (periodo: string) => opciones.find((o) => o.periodo === periodo)?.montoSugerido
  const [periodo, setPeriodo] = useState(pago?.periodo ?? periodoInicial)
  const [monto, setMonto] = useState(String(pago?.monto ?? sugeridoDe(periodoInicial) ?? ''))
  const [sugerido, setSugerido] = useState(!pago)

  const cambiarPeriodo = (nuevo: string) => {
    setPeriodo(nuevo)
    // Solo pisa el monto si el usuario no lo tocó
    const valor = sugeridoDe(nuevo)
    if (sugerido && valor !== undefined) setMonto(String(valor))
  }

  const metodo = MEDIOS_PAGO.find((m) => m === (pago?.metodoPago ?? metodoInicial)) ?? MEDIO_PAGO_POR_DEFECTO

  return (
    <Formulario accion={accion} textoBoton={textoBoton}>
      {volver && <input type="hidden" name="volver" value={volver} />}

      <Campo nombre="periodo" label="Período que cubre *" ayuda="El mes (o año, si es anual) al que corresponde el pago">
        <Select name="periodo" required value={periodo} onChange={(e) => cambiarPeriodo(e.target.value)}>
          {opciones.map((o) => <option key={o.periodo} value={o.periodo}>{o.label}</option>)}
        </Select>
      </Campo>

      <FilaCampos>
        <Campo nombre="fecha" label="Fecha de pago *">
          <Input name="fecha" type="date" required defaultValue={aInputFecha(pago?.fecha) || fechaPorDefecto} />
        </Campo>
        <Campo nombre="monto" label="Monto *" ayuda={sugerido ? 'Sugerido: lo que falta del período' : undefined}>
          <Input
            name="monto"
            type="number"
            step="0.01"
            min="0"
            required
            value={monto}
            onChange={(e) => {
              setMonto(e.target.value)
              setSugerido(false)
            }}
            placeholder="0.00"
          />
        </Campo>
        <Campo nombre="moneda" label="Moneda">
          <Select name="moneda" defaultValue={pago?.moneda ?? monedaInicial}>
            {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </Campo>
      </FilaCampos>

      <Campo nombre="metodo_pago" label="Método de pago">
        <Select name="metodo_pago" defaultValue={metodo}>
          {MEDIOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>
      </Campo>

      <Campo nombre="notas" label="Notas">
        <Textarea name="notas" defaultValue={pago?.notas ?? ''} placeholder="Opcional: comprobante, aclaraciones" />
      </Campo>
    </Formulario>
  )
}
