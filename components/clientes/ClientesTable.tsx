'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ClienteRow } from '@/lib/types'
import { ClienteRowActions } from './ClienteRowActions'
import { SearchInput } from '@/components/ui/SearchInput'

const coincide = (cliente: ClienteRow, query: string): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [cliente.nombre, cliente.contacto, cliente.telefono, cliente.emailContacto, cliente.pais]
    .filter((campo): campo is string => Boolean(campo))
    .some((campo) => campo.toLowerCase().includes(q))
}

interface ClientesTableProps {
  clientes: ClienteRow[]
}

export const ClientesTable = ({ clientes }: ClientesTableProps) => {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')

  const filtrados = clientes.filter((c) => coincide(c, busqueda))

  return (
    <div>
      <div className="mb-5">
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, contacto, email..." />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-brand-white">
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-dark-text/50 uppercase tracking-wider">
                Teléfono
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
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center text-sm text-dark-text/40">
                  {clientes.length === 0 ? 'No hay clientes cargados.' : 'No se encontraron clientes.'}
                </td>
              </tr>
            ) : (
              filtrados.map((cliente) => (
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
                    {cliente.contacto ?? <span className="text-dark-text/30">—</span>}
                  </td>
                  <td className="px-5 py-4 text-dark-text/60">
                    {cliente.telefono ?? <span className="text-dark-text/30">—</span>}
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
    </div>
  )
}
