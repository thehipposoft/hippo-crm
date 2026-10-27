import Link from 'next/link'
import { Field } from '@/components/ui/Field'
import { wpGet, wpGetONotFound } from '@/lib/wp'
import { ProyectosTable } from '@/components/proyectos/ProyectosTable'
import type { ClienteRow, PagoRow, ProyectoRow } from '@/lib/types'

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cliente = await wpGetONotFound<ClienteRow>(`/clientes/${id}`)

  const [proyectos, pagos] = await Promise.all([
    wpGet<ProyectoRow[]>(`/clientes/${id}/proyectos`),
    wpGet<PagoRow[]>('/pagos'),
  ])

  return (
    <div className="max-w-2xl px-4 py-8 sm:px-8">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
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
        <Field label="Contacto" value={cliente.contacto ?? '—'} />
        <Field label="Teléfono" value={cliente.telefono ?? '—'} />
        <Field label="Email" value={cliente.emailContacto ?? '—'} />
        <Field label="País" value={cliente.pais ?? '—'} />
      </div>

      <h2 className="mb-4 text-sm font-semibold text-dark-text">Proyectos</h2>
      <ProyectosTable proyectos={proyectos} pagos={pagos} mostrarCliente={false} />
    </div>
  )
}
