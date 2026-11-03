import { BarraDocumento } from '@/components/documentos/BarraDocumento'
import { PropuestaDocumento } from '@/components/documentos/PropuestaDocumento'
import { estaVencida } from '@/lib/propuestas'
import type { ClienteRow, CuentaBancariaRow, PropuestaPublica, PropuestaRow } from '@/lib/types'
import { wpGetONotFound, wpGetOpcional } from '@/lib/wp'

// Vista previa interna (también de borradores): el mismo documento que ve el cliente, sin aceptar / rechazar
export default async function PropuestaDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const propuesta = await wpGetONotFound<PropuestaRow>(`/propuestas/${id}`)
  const [cliente, cuentas] = await Promise.all([
    propuesta.clienteId ? wpGetOpcional<ClienteRow | null>(`/clientes/${propuesta.clienteId}`, null) : null,
    wpGetOpcional<CuentaBancariaRow[]>('/cuentas-bancarias', []),
  ])

  const publica: PropuestaPublica = {
    ...propuesta,
    cliente: { nombre: cliente?.nombre ?? propuesta.clienteNombre, contacto: cliente?.contacto ?? null, pais: cliente?.pais ?? null },
    cuentas: propuesta.cuentas
      .map((cuentaId) => cuentas.find((c) => c.id === cuentaId))
      .filter((c): c is CuentaBancariaRow => c !== undefined)
      .map(({ nombre, detalle }) => ({ nombre, detalle })),
    vencida: estaVencida(propuesta),
  }

  return (
    <>
      <BarraDocumento idioma={propuesta.idioma} volverHref={`/propuestas/${id}`} sinIdioma>
        {propuesta.estado === 'BORRADOR' && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">Borrador: el cliente todavía no lo ve</span>
        )}
      </BarraDocumento>
      <PropuestaDocumento propuesta={publica} />
    </>
  )
}
