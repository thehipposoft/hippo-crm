import { TareasBoard } from '@/components/tareas/TareasBoard'
import { PageHeader } from '@/components/ui/PageHeader'
import { getNombreCompletoUsuario } from '@/lib/auth'
import { aIso, hoy } from '@/lib/fechas'
import { estaAbierta } from '@/lib/tareas'
import type { TareaRow, UsuarioRow } from '@/lib/types'
import { wpGet, wpGetOpcional } from '@/lib/wp'

export const metadata = { title: 'Tareas' }

export default async function TareasPage() {
  const [tareas, usuarios, miNombre] = await Promise.all([
    wpGet<TareaRow[]>('/tareas'),
    wpGetOpcional<UsuarioRow[]>('/usuarios', []),
    getNombreCompletoUsuario(),
  ])
  const miUsuarioId = usuarios.find((u) => u.nombre === miNombre)?.id ?? null
  const abiertas = tareas.filter(estaAbierta).length

  return (
    <div className="px-4 py-8 sm:px-8">
      <PageHeader
        titulo="Tareas"
        cantidad={abiertas}
        singular="abierta"
        plural="abiertas"
        nuevoHref="/tareas/nueva"
        nuevoLabel="Nueva tarea"
      />
      <TareasBoard tareas={tareas} usuarios={usuarios} hoyIso={aIso(hoy())} miUsuarioId={miUsuarioId} />
    </div>
  )
}
