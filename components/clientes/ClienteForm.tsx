'use client'

import { Campo, Formulario, Input } from '@/components/ui/Formulario'
import type { AccionFormulario } from '@/lib/formularios'
import type { ClienteRow } from '@/lib/types'

interface ClienteFormProps {
  accion: AccionFormulario
  textoBoton: string
  cliente?: ClienteRow
}

export const ClienteForm = ({ accion, textoBoton, cliente }: ClienteFormProps) => (
  <Formulario accion={accion} textoBoton={textoBoton}>
    <Campo nombre="nombre" label="Nombre de la empresa *">
      <Input name="nombre" type="text" required defaultValue={cliente?.nombre} placeholder="Ej: Acme Inc." />
    </Campo>
    <Campo nombre="contacto" label="Contacto">
      <Input name="contacto" type="text" defaultValue={cliente?.contacto ?? ''} placeholder="Nombre de la persona de contacto" />
    </Campo>
    <Campo nombre="telefono" label="Teléfono">
      <Input name="telefono" type="tel" defaultValue={cliente?.telefono ?? ''} placeholder="Opcional" />
    </Campo>
    <Campo nombre="email_contacto" label="Email">
      <Input name="email_contacto" type="email" defaultValue={cliente?.emailContacto ?? ''} placeholder="Opcional" />
    </Campo>
    <Campo nombre="pais" label="País">
      <Input name="pais" type="text" defaultValue={cliente?.pais ?? ''} placeholder="Opcional" />
    </Campo>
  </Formulario>
)
