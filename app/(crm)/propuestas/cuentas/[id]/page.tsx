import { CuentaForm } from '@/components/propuestas/CuentaForm'
import { PaginaFormulario } from '@/components/ui/PaginaFormulario'
import type { CuentaBancariaRow } from '@/lib/types'
import { wpGetONotFound } from '@/lib/wp'
import { actualizarCuenta } from '../actions'

export default async function EditarCuentaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cuenta = await wpGetONotFound<CuentaBancariaRow>(`/cuentas-bancarias/${id}`)
  return (
    <PaginaFormulario titulo="Editar cuenta bancaria" volverHref="/propuestas/cuentas" volverLabel="Volver a cuentas">
      <CuentaForm accion={actualizarCuenta.bind(null, id)} textoBoton="Guardar cambios" cuenta={cuenta} />
    </PaginaFormulario>
  )
}
