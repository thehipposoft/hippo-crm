'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ClienteRow } from '@/lib/types'
import { ContenedorTabla, FilaTabla } from '@/components/ui/FilaTabla'
import { RowActions } from '@/components/ui/RowActions'
import { Th, ThOrdenable, useOrdenTabla } from '@/components/ui/Orden'
import type { ColumnaOrden } from '@/lib/orden'
import { SearchInput } from '@/components/ui/SearchInput'

const coincide = (cliente: ClienteRow, query: string): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [cliente.nombre, cliente.contacto, cliente.telefono, cliente.emailContacto, cliente.pais]
    .filter((campo): campo is string => Boolean(campo))
    .some((campo) => campo.toLowerCase().includes(q))
}

const COLUMNAS = {
  nombre: { valor: (c) => c.nombre, direccionInicial: 'asc' },
  contacto: { valor: (c) => c.contacto, direccionInicial: 'asc' },
  email: { valor: (c) => c.emailContacto, direccionInicial: 'asc' },
  pais: { valor: (c) => c.pais, direccionInicial: 'asc' },
} satisfies Record<string, ColumnaOrden<ClienteRow>>

interface ClientesTableProps {
  clientes: ClienteRow[]
}

export const ClientesTable = ({ clientes }: ClientesTableProps) => {
  const [busqueda, setBusqueda] = useState('')

  const { orden, cambiarOrden, ordenar } = useOrdenTabla(COLUMNAS, { columna: 'nombre', direccion: 'asc' })
  const filtrados = ordenar(clientes.filter((c) => coincide(c, busqueda)))
  const thProps = { orden, onOrdenar: cambiarOrden }

  return (
    <div>
      <div className="mb-5">
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, contacto, email..." />
      </div>

      <ContenedorTabla>
        <table className="w-full min-w-3xl text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-brand-white">
              <ThOrdenable id="nombre" {...thProps}>Nombre</ThOrdenable>
              <ThOrdenable id="contacto" {...thProps}>Contacto</ThOrdenable>
              <Th>Teléfono</Th>
              <ThOrdenable id="email" {...thProps}>Email</ThOrdenable>
              <ThOrdenable id="pais" {...thProps}>País</ThOrdenable>
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
                <FilaTabla key={cliente.id} href={`/clientes/${cliente.id}`}>
                  <td className="px-5 py-4">
                    <Link href={`/clientes/${cliente.id}`} className="font-medium text-dark-text hover:text-brand-blue">
                      {cliente.nombre}
                    </Link>
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
                  <td className="px-3 py-4" data-sin-navegar>
                    <RowActions verHref={`/clientes/${cliente.id}`} editarHref={`/clientes/${cliente.id}/editar`} />
                  </td>
                </FilaTabla>
              ))
            )}
          </tbody>
        </table>
      </ContenedorTabla>
    </div>
  )
}
