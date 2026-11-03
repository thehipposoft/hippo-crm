import { aIso, hoy, sumarDias } from './fechas'
import { DIAS_VALIDEZ_POR_DEFECTO, PLANTILLAS_BASE, type OpcionPlantilla } from './propuestas'
import type { ClienteRow, CuentaBancariaRow, PlantillaRow, ProyectoRow } from './types'
import { wpGet, wpGetOpcional } from './wp'

// Datos que necesita el form de propuestas (alta y edición)
export const datosFormPropuesta = async () => {
  const [clientes, proyectos, cuentas, guardadas] = await Promise.all([
    wpGet<ClienteRow[]>('/clientes'),
    wpGet<ProyectoRow[]>('/proyectos'),
    wpGetOpcional<CuentaBancariaRow[]>('/cuentas-bancarias', []),
    wpGetOpcional<PlantillaRow[]>('/plantillas', []),
  ])
  const fechaHoy = hoy()
  // Primero las del equipo; las base siempre están
  const plantillas: OpcionPlantilla[] = [
    ...guardadas.map((p) => ({ ...p, clave: String(p.id) })),
    ...PLANTILLAS_BASE.map((p) => ({ ...p, clave: p.id })),
  ]
  return {
    clientes: [...clientes].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    proyectos,
    cuentas,
    plantillas,
    fechaHoy: aIso(fechaHoy),
    vencimientoSugerido: aIso(sumarDias(fechaHoy, DIAS_VALIDEZ_POR_DEFECTO)),
  }
}
