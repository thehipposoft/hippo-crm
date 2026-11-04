import { aIso, diasEntre, fechaEnZona, parseFecha } from './fechas'
import type { PropuestaRow, ProyectoRow } from './types'

// Cuándo se envió y se aprobó la propuesta de un proyecto.
// Manda el registro manual del proyecto (propuestas hechas fuera del CRM); si no hay,
// se toma de las propuestas del CRM vinculadas al proyecto.

export type FechaPropuesta = {
  fecha: string
  // De dónde sale: carga manual o la propuesta del CRM (con su id)
  origen: { tipo: 'MANUAL' } | { tipo: 'CRM'; propuesta: PropuestaRow }
}

export type ResumenPropuestaProyecto = {
  vinculadas: PropuestaRow[]
  enviada: FechaPropuesta | null
  aprobada: FechaPropuesta | null
  // Días entre el envío y la aprobación
  dias: number | null
}

const diaDeInstante = (iso: string | null): string | null => {
  const fecha = iso ? fechaEnZona(iso) : null
  return fecha ? aIso(fecha) : null
}

const primeraDel = (propuestas: PropuestaRow[], fechaDe: (p: PropuestaRow) => string | null): FechaPropuesta | null => {
  const candidatas = propuestas
    .map((propuesta) => ({ propuesta, fecha: fechaDe(propuesta) }))
    .filter((c): c is { propuesta: PropuestaRow; fecha: string } => c.fecha !== null)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
  const primera = candidatas[0]
  return primera ? { fecha: primera.fecha, origen: { tipo: 'CRM', propuesta: primera.propuesta } } : null
}

export const resumenPropuestaProyecto = (
  proyecto: Pick<ProyectoRow, 'id' | 'propuestaEnviada' | 'propuestaAprobada'>,
  propuestas: PropuestaRow[]
): ResumenPropuestaProyecto => {
  const vinculadas = propuestas
    .filter((p) => p.proyectoId === proyecto.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)

  const enviada: FechaPropuesta | null = proyecto.propuestaEnviada
    ? { fecha: proyecto.propuestaEnviada.slice(0, 10), origen: { tipo: 'MANUAL' } }
    : primeraDel(vinculadas, (p) => diaDeInstante(p.enviadaEl))
  const aprobada: FechaPropuesta | null = proyecto.propuestaAprobada
    ? { fecha: proyecto.propuestaAprobada.slice(0, 10), origen: { tipo: 'MANUAL' } }
    : primeraDel(
        vinculadas.filter((p) => p.estado === 'ACEPTADA'),
        (p) => diaDeInstante(p.respondidaEl)
      )

  const desde = parseFecha(enviada?.fecha)
  const hasta = parseFecha(aprobada?.fecha)
  return { vinculadas, enviada, aprobada, dias: desde && hasta ? diasEntre(desde, hasta) : null }
}
