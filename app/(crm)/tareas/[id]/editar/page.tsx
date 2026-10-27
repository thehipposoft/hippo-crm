import { EliminarTareaButton } from '@/components/tareas/EliminarTareaButton'
import { TareaForm } from '@/components/tareas/TareaForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { formatFecha } from '@/lib/format'
import type { ProyectoRow, TareaRow, UsuarioRow } from '@/lib/types'
import { wpGet, wpGetONotFound, wpGetOpcional } from '@/lib/wp'
import { actualizarTarea } from '../../actions'

export default async function EditarTareaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [tarea, usuarios, proyectos] = await Promise.all([
    wpGetONotFound<TareaRow>(`/tareas/${id}`),
    wpGetOpcional<UsuarioRow[]>('/usuarios', []),
    wpGet<ProyectoRow[]>('/proyectos'),
  ])

  return (
    <PaginaFormulario titulo="Editar tarea" volverHref="/tareas" volverLabel="Volver a tareas">
      <p className="-mt-4 mb-6 text-xs text-dark-text/50">Creada el {formatFecha(tarea.creada)}</p>
      <TareaForm
        accion={actualizarTarea.bind(null, id)}
        textoBoton="Guardar cambios"
        usuarios={usuarios}
        proyectos={proyectos}
        tarea={tarea}
        volver="/tareas"
      />
      <div className="mt-6 border-t border-slate-200 pt-6">
        <EliminarTareaButton tareaId={tarea.id} titulo={tarea.titulo} />
      </div>
    </PaginaFormulario>
  )
}
