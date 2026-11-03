'use client'

import { useState } from 'react'
import { Campo, FilaCampos, Formulario, Input, Select, Textarea } from '@/components/ui/Formulario'
import type { AccionFormulario } from '@/lib/formularios'
import { plantillaBase } from '@/lib/propuestas'
import { TIPOS_PROPUESTA, type PlantillaRow } from '@/lib/types'
import { EditorItems } from './EditorItems'
import { EditorSecciones } from './EditorSecciones'

interface PlantillaFormProps {
  accion: AccionFormulario
  textoBoton: string
  plantilla?: PlantillaRow
}

// Plantilla: el punto de partida de una propuesta o cotización (secciones, ítems y condiciones)
export const PlantillaForm = ({ accion, textoBoton, plantilla }: PlantillaFormProps) => {
  const base = plantilla ?? plantillaBase('PROPUESTA', 'es')
  const [secciones, setSecciones] = useState(base.secciones)
  const [items, setItems] = useState(base.items)

  return (
    <Formulario accion={accion} textoBoton={textoBoton}>
      <input type="hidden" name="secciones" value={JSON.stringify(secciones)} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <Campo nombre="nombre" label="Nombre *">
        <Input name="nombre" required defaultValue={plantilla?.nombre} placeholder="Ej: Sitio web institucional" />
      </Campo>
      <FilaCampos>
        <Campo nombre="tipo" label="Tipo">
          <Select name="tipo" defaultValue={base.tipo}>
            {TIPOS_PROPUESTA.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo nombre="idioma" label="Idioma">
          <Select name="idioma" defaultValue={base.idioma}>
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </Select>
        </Campo>
      </FilaCampos>

      <div>
        <p className="mb-2 text-sm font-semibold text-dark-text">Secciones</p>
        <Campo nombre="secciones" label="">
          <EditorSecciones secciones={secciones} onChange={setSecciones} />
        </Campo>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-dark-text">Ítems</p>
        <Campo nombre="items" label="">
          <EditorItems items={items} onChange={setItems} />
        </Campo>
      </div>

      <Campo nombre="notas" label="Condiciones">
        <Textarea name="notas" rows={3} defaultValue={base.notas ?? ''} />
      </Campo>
    </Formulario>
  )
}

