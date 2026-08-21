'use client'

import { useRouter } from 'next/navigation'
import type { ClienteRow } from '@/lib/types'
import { ClienteRowActions } from './ClienteRowActions'

interface ClientesTableProps {
  clientes: ClienteRow[]
}

export const ClientesTable = ({ clientes }: ClientesTableProps) => {
  const router = useRouter()

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-brand-white">
            <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
              Empresa
            </th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
              Email
            </th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
              País
            </th>
            <th className="px-3 py-3.5 w-12" />
          </tr>
        </thead>
        <tbody>
          {clientes.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-14 text-center text-sm text-dark-text/40">
                No hay clientes cargados.
              </td>
            </tr>
          ) : (
            clientes.map((cliente) => (
              <tr
                key={cliente.id}
                onClick={() => router.push(`/clientes/${cliente.id}`)}
                className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-brand-white transition-colors"
              >
                <td className="px-5 py-4">
                  <span className="font-medium text-dark-text">
                    {cliente.nombre}
                  </span>
                </td>
                <td className="px-5 py-4 text-dark-text/60">
                  {cliente.empresa ?? <span className="text-dark-text/30">—</span>}
                </td>
                <td className="px-5 py-4 text-dark-text/60">
                  {cliente.emailContacto ?? <span className="text-dark-text/30">—</span>}
                </td>
                <td className="px-5 py-4 text-dark-text/60">
                  {cliente.pais ?? <span className="text-dark-text/30">—</span>}
                </td>
                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                  <ClienteRowActions clienteId={cliente.id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
