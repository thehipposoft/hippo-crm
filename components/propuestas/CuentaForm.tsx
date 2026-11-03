import { Campo, Formulario, Input, Select, Textarea } from '@/components/ui/Formulario'
import type { AccionFormulario } from '@/lib/formularios'
import { MONEDAS, type CuentaBancariaRow } from '@/lib/types'

interface CuentaFormProps {
  accion: AccionFormulario
  textoBoton: string
  cuenta?: CuentaBancariaRow
}

export const CuentaForm = ({ accion, textoBoton, cuenta }: CuentaFormProps) => (
  <Formulario accion={accion} textoBoton={textoBoton}>
    <Campo nombre="nombre" label="Nombre *" ayuda="Así aparece en el documento (ej. Transferencia en EUR, PayPal).">
      <Input name="nombre" required defaultValue={cuenta?.nombre} placeholder="Ej: Transferencia en EUR (Wise)" />
    </Campo>
    <Campo nombre="moneda" label="Moneda" ayuda="Las cuentas de la moneda del documento se tildan solas.">
      <Select name="moneda" defaultValue={cuenta?.moneda ?? ''}>
        <option value="">Cualquiera</option>
        {MONEDAS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>
    </Campo>
    <Campo nombre="detalle" label="Datos *" ayuda="Se muestran tal cual, línea por línea: titular, banco, IBAN, BSB, alias, etc.">
      <Textarea
        name="detalle"
        rows={6}
        required
        defaultValue={cuenta?.detalle}
        placeholder={'Titular: Diego Borigen\nIBAN: BE00 0000 0000 0000\nBIC: TRWIBEB1XXX'}
      />
    </Campo>
  </Formulario>
)
