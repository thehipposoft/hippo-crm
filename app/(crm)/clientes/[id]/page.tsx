import { cookies } from 'next/headers'
import { notFound, unstable_rethrow } from 'next/navigation'
import Link from 'next/link'
import { wpFetch } from '@/lib/wp'
import { ProyectosTable } from '@/components/proyectos/ProyectosTable'
import type { ClienteRow, ProyectoRow } from '@/lib/types'

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const token = (await cookies()).get('hippo_token')?.value

  let cliente: ClienteRow
  try {
    cliente = await wpFetch(`/clientes/${id}`, token)
  } catch (error) {
    unstable_rethrow(error)
    notFound()
  }

  const proyectos = await wpFetch<ProyectoRow[]>(`/clientes/${id}/proyectos`, token)

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <Link href="/clientes" className="text-xs text-dark-text/50 hover:text-dark-text transition-colors">
            ← Volver a clientes
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-dark-text">{cliente.nombre}</h1>
        </div>
        <Link
          href={`/clientes/${cliente.id}/editar`}
          className="rounded-lg border border-slate-200 bg-white hover:bg-brand-blue/10 px-4 py-2 text-sm font-medium text-dark-text transition-colors"
        >
          Editar
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 mb-8">
        <Field label="Empresa" value={cliente.empresa ?? '—'} />
        <Field label="Email" value={cliente.emailContacto ?? '—'} />
        <Field label="País" value={cliente.pais ?? '—'} />
      </div>

      <h2 className="mb-4 text-sm font-semibold text-dark-text">Proyectos</h2>
      <ProyectosTable proyectos={proyectos} mostrarCliente={false} />
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-xs font-medium text-dark-text/50 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-dark-text/80">{value}</span>
    </div>
  )
}
