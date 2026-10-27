'use client'

import { Campo, FilaCampos, Formulario, Input, Select, Textarea } from '@/components/ui/Formulario'
import { aInputFecha } from '@/lib/format'
import type { AccionFormulario } from '@/lib/formularios'
import { ESTADOS_TAREA, PRIORIDADES, type ProyectoRow, type TareaRow, type UsuarioRow } from '@/lib/types'

interface TareaFormProps {
  accion: AccionFormulario
  textoBoton: string
  usuarios: UsuarioRow[]
  proyectos: ProyectoRow[]
  tarea?: TareaRow
  proyectoIdInicial?: number
  responsableIdInicial?: number
  volver?: string
}

export const TareaForm = ({
  accion,
  textoBoton,
  usuarios,
  proyectos,
  tarea,
  proyectoIdInicial,
  responsableIdInicial,
  volver,
}: TareaFormProps) => (
  <Formulario accion={accion} textoBoton={textoBoton}>
    {volver && <input type="hidden" name="volver" value={volver} />}

    <Campo nombre="titulo" label="Qué hay que hacer o definir *">
      <Input name="titulo" type="text" required defaultValue={tarea?.titulo} placeholder="Ej: Definir proveedor de hosting" />
    </Campo>

    <Campo nombre="descripcion" label="Detalle">
      <Textarea name="descripcion" rows={4} defaultValue={tarea?.descripcion ?? ''} placeholder="Opcional — contexto, opciones, links" />
    </Campo>

    <FilaCampos>
      <Campo nombre="estado" label="Estado">
        <Select name="estado" defaultValue={tarea?.estado ?? 'PENDIENTE'}>
          {ESTADOS_TAREA.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </Select>
      </Campo>
      <Campo nombre="prioridad" label="Prioridad">
        <Select name="prioridad" defaultValue={tarea?.prioridad ?? 'MEDIA'}>
          {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>
      </Campo>
    </FilaCampos>

    <FilaCampos>
      <Campo nombre="responsable_id" label="Responsable">
        <Select name="responsable_id" defaultValue={tarea ? (tarea.responsableId ?? '') : (responsableIdInicial ?? '')}>
          <option value="">Sin asignar</option>
          {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
        </Select>
      </Campo>
      <Campo nombre="fecha_limite" label="Fecha límite">
        <Input name="fecha_limite" type="date" defaultValue={aInputFecha(tarea?.fechaLimite)} />
      </Campo>
    </FilaCampos>

    <Campo nombre="proyecto_id" label="Proyecto" ayuda="Opcional — aparece también en la ficha del proyecto">
      <Select name="proyecto_id" defaultValue={tarea ? (tarea.proyectoId ?? '') : (proyectoIdInicial ?? '')}>
        <option value="">Ninguno (tarea interna)</option>
        {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.clienteNombre})</option>)}
      </Select>
    </Campo>
  </Formulario>
)
