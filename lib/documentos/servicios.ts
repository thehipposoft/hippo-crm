import type { FechaCalendario } from '@/lib/fechas'
import { resumenPropuestaProyecto } from '@/lib/propuestaProyecto'
import { numeroPropuesta } from '@/lib/propuestas'
import type { Saldo } from '@/lib/proyectos'
import type { FrecuenciaPago, MedioAprobacion, Moneda, PropuestaProyectoPublica, ProyectoRow } from '@/lib/types'
import type { MesUnidades } from '@/lib/unidades'
import type { EstadoDeCuenta } from './estadoDeCuenta'

// Vista "por servicio" del estado de cuenta (link público y portal): todo serializable,
// porque se pasa a un componente de cliente

export type TipoServicio = 'UNICO' | 'RECURRENTE' | 'POR_UNIDAD'

// Solo lo que ve el cliente de cada pago (nunca las notas)
export type PagoServicio = { id: number; fecha: string | null; monto: number; moneda: Moneda; medioPago: string | null }

// Propuesta del servicio: cuándo se envió y aprobó, y quién la aprobó (fechas 'YYYY-MM-DD')
export type AprobacionServicio = {
  enviada: string | null
  aprobada: string | null
  aprobadaPor: string | null
  // Solo en propuestas hechas fuera del CRM
  medio: MedioAprobacion | null
  // La aceptó con su nombre en el link de la propuesta
  enLink: boolean
  // Propuesta del CRM (para el link "Ver propuesta")
  propuesta: { numero: string; titulo: string; token: string | null } | null
}

export type Servicio = {
  id: number
  nombre: string
  tipo: TipoServicio
  moneda: Moneda
  valor: number
  frecuencia: FrecuenciaPago | null
  unidad: string | null
  // Ya no se cobra (proyecto cerrado)
  finalizado: boolean
  adeudado: number
  pagado: number
  saldo: Saldo
  // Parte pagada de lo adeudado, entre 0 y 1
  progreso: number
  // Recurrente con cuota fija: cuotas que cubre la deuda (redondeado hacia arriba)
  cuotasPendientes: number | null
  proximo: { fecha: FechaCalendario; monto: number } | null
  pagos: PagoServicio[]
  // Pagos en otra moneda (no se descuentan del saldo)
  otrasMonedas: Partial<Record<Moneda, number>>
  meses: MesUnidades[] | null
  activas: string[] | null
  aprobacion: AprobacionServicio | null
}

// Diferencias de redondeo al dividir la deuda por la cuota
const TOLERANCIA_CUOTAS = 0.01

const progresoDe = (pagado: number, adeudado: number): number =>
  adeudado <= 0 ? (pagado > 0 ? 1 : 0) : Math.min(1, Math.max(0, pagado / adeudado))

const ORDEN_SALDO: Record<Saldo['tipo'], number> = { PENDIENTE: 0, A_FAVOR: 1, AL_DIA: 2 }

// Con deuda primero (la más grande arriba), después a favor y al día; los finalizados al final
// Mismo criterio que la ficha del proyecto: manda el registro manual; si no, las propuestas del CRM
export const aprobacionDe = (
  proyecto: Pick<ProyectoRow, 'id' | 'propuestaEnviada' | 'propuestaAprobada' | 'propuestaAprobadaPor' | 'propuestaMedio'>,
  propuestas: PropuestaProyectoPublica[]
): AprobacionServicio | null => {
  const { enviada, aprobada } = resumenPropuestaProyecto(proyecto, propuestas)
  const aprobadaEnCrm = aprobada?.origen.tipo === 'CRM' ? aprobada.origen.propuesta : null
  const delCrm = aprobadaEnCrm ?? (enviada?.origen.tipo === 'CRM' ? enviada.origen.propuesta : null)
  const aprobadaPor = aprobadaEnCrm ? aprobadaEnCrm.respuestaNombre : (proyecto.propuestaAprobadaPor ?? null)
  const medio = aprobadaEnCrm ? null : (proyecto.propuestaMedio ?? null)
  if (!enviada && !aprobada && !aprobadaPor && !medio) return null

  return {
    enviada: enviada?.fecha ?? null,
    aprobada: aprobada?.fecha ?? null,
    aprobadaPor,
    medio,
    enLink: aprobadaEnCrm?.respuestaNombre != null,
    propuesta: delCrm ? { numero: numeroPropuesta(delCrm), titulo: delCrm.titulo, token: delCrm.token } : null,
  }
}

export const armarServicios = (estado: EstadoDeCuenta, propuestas: PropuestaProyectoPublica[] = []): Servicio[] => {
  const servicios = estado.proyectos.map(({ proyecto, resumen, saldo }): Servicio => {
    const unidades = estado.unidades.find((u) => u.proyecto.id === proyecto.id)
    const proximo = estado.proximos.find((p) => p.proyecto.id === proyecto.id)
    const tipo: TipoServicio = proyecto.tipoProyecto !== 'RECURRENTE' ? 'UNICO' : unidades ? 'POR_UNIDAD' : 'RECURRENTE'
    const cuotas = tipo === 'RECURRENTE' && saldo.tipo === 'PENDIENTE' && proyecto.valor > 0
      ? Math.ceil(saldo.monto / proyecto.valor - TOLERANCIA_CUOTAS)
      : null

    return {
      id: proyecto.id,
      nombre: proyecto.nombre,
      tipo,
      moneda: resumen.moneda,
      valor: proyecto.valor,
      frecuencia: tipo === 'UNICO' ? null : (proyecto.frecuenciaPago ?? 'MENSUAL'),
      unidad: proyecto.unidad ?? null,
      finalizado: proyecto.estado === 'CERRADO',
      adeudado: resumen.adeudado,
      pagado: resumen.pagado,
      saldo,
      progreso: progresoDe(resumen.pagado, resumen.adeudado),
      cuotasPendientes: cuotas,
      proximo: proximo
        ? { fecha: proximo.proximoVencimiento, monto: (proximo.unidadesEsteMes ?? 1) * proyecto.valor }
        : null,
      pagos: estado.movimientos
        .filter((p) => Number(p.proyectoId) === Number(proyecto.id))
        .map(({ id, fecha, monto, moneda, medioPago }) => ({ id, fecha, monto, moneda, medioPago })),
      otrasMonedas: resumen.otrasMonedas,
      meses: unidades?.meses ?? null,
      activas: unidades ? unidades.activasEsteMes.map((u) => u.nombre) : null,
      aprobacion: aprobacionDe(proyecto, propuestas),
    }
  })

  const montoDeuda = (s: Servicio) => (s.saldo.tipo === 'PENDIENTE' ? s.saldo.monto : 0)
  return servicios
    .map((s, i) => ({ s, i }))
    .sort(
      (a, b) =>
        Number(a.s.finalizado && a.s.saldo.tipo !== 'PENDIENTE') - Number(b.s.finalizado && b.s.saldo.tipo !== 'PENDIENTE') ||
        ORDEN_SALDO[a.s.saldo.tipo] - ORDEN_SALDO[b.s.saldo.tipo] ||
        montoDeuda(b.s) - montoDeuda(a.s) ||
        a.i - b.i
    )
    .map(({ s }) => s)
}

export type FiltroServicios = 'TODOS' | 'CON_SALDO' | 'AL_DIA'

export const filtrarServicios = (servicios: Servicio[], filtro: FiltroServicios): Servicio[] =>
  filtro === 'TODOS'
    ? servicios
    : servicios.filter((s) => (filtro === 'CON_SALDO' ? s.saldo.tipo === 'PENDIENTE' : s.saldo.tipo !== 'PENDIENTE'))

// Detalle del saldo pendiente por moneda: lo que debe cada servicio y, en negativo, lo que tiene
// a favor (el total ya lo descuenta, así la suma del detalle coincide con el saldo)
export type DetalleSaldo = { moneda: Moneda; items: { id: number; nombre: string; monto: number }[] }

export const detalleSaldo = (servicios: Servicio[]): DetalleSaldo[] => {
  const grupos = new Map<Moneda, DetalleSaldo['items']>()
  for (const s of servicios) {
    if (s.saldo.tipo === 'AL_DIA') continue
    const monto = s.saldo.tipo === 'PENDIENTE' ? s.saldo.monto : -s.saldo.monto
    grupos.set(s.moneda, [...(grupos.get(s.moneda) ?? []), { id: s.id, nombre: s.nombre, monto }])
  }
  return [...grupos.entries()].map(([moneda, items]) => ({ moneda, items }))
}
