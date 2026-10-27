import { TareaForm } from '@/components/tareas/TareaForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import { getNombreCompletoUsuario } from '@/lib/auth'
import { destinoSeguro } from '@/lib/formularios'
import type { ProyectoRow, UsuarioRow } from '@/lib/types'
import { wpGet, wpGetOpcional } from '@/lib/wp'
import { crearTarea } from '../actions'

export default async function NuevaTareaPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string; volver?: string }>
}) {
  const { proyecto, volver } = await searchParams
  const [usuarios, proyectos, miNombre] = await Promise.all([
    wpGetOpcional<UsuarioRow[]>('/usuarios', []),
    wpGet<ProyectoRow[]>('/proyectos'),
    getNombreCompletoUsuario(),
  ])
  const destino = destinoSeguro(volver, '/tareas')

  return (
    <PaginaFormulario titulo="Nueva tarea" volverHref={destino} volverLabel="Volver">
      <TareaForm
        accion={crearTarea}
        textoBoton="Guardar tarea"
        usuarios={usuarios}
        proyectos={proyectos}
        proyectoIdInicial={proyecto ? Number(proyecto) : undefined}
        responsableIdInicial={usuarios.find((u) => u.nombre === miNombre)?.id}
        volver={destino}
      />
    </PaginaFormulario>
  )
}
