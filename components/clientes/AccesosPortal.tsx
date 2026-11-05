'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cambiarAcceso, eliminarAcceso, invitarAcceso, reenviarInvitacion } from '@/app/(crm)/clientes/[id]/accesos/actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CLASES_CONTROL } from '@/components/ui/Formulario'
import { fechaEnZona } from '@/lib/fechas'
import { formatFechaCorta } from '@/lib/format'
import type { AccesoRow, EstadoAcceso } from '@/lib/types'

const ESTADOS: Record<EstadoAcceso, { label: string; clases: string }> = {
  INVITADO: { label: 'Invitación enviada', clases: 'bg-brand-blue/10 text-cyan-800' },
  ACTIVO: { label: 'Activo', clases: 'bg-brand-forest/10 text-brand-forest' },
  DESACTIVADO: { label: 'Desactivado', clases: 'bg-slate-100 text-dark-text/50' },
}

const BOTON_CHICO = 'rounded-md px-2 py-1 text-xs font-medium text-dark-text/60 transition-colors hover:bg-brand-blue/10 hover:text-dark-text disabled:opacity-50'

const dia = (iso: string | null): string | null => {
  const fecha = iso ? fechaEnZona(iso) : null
  return fecha ? formatFechaCorta(fecha) : null
}

interface AccesosPortalProps {
  clienteId: number
  accesos: AccesoRow[]
  emailSugerido: string | null
  nombreSugerido: string | null
}

const MS_ESPERA_REFRESCO = 2500

// Personas del cliente que entran al portal (estado de cuenta con contraseña)
export const AccesosPortal = ({ clienteId, accesos, emailSugerido, nombreSugerido }: AccesosPortalProps) => {
  const sinAccesoTodavia = emailSugerido && !accesos.some((a) => a.email === emailSugerido.toLowerCase())
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState(sinAccesoTodavia ? (nombreSugerido ?? '') : '')
  const [email, setEmail] = useState(sinAccesoTodavia ? emailSugerido : '')
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'ok'; texto: string } | null>(null)
  const [borrar, setBorrar] = useState<AccesoRow | null>(null)
  const [pending, setPending] = useState(false)
  const router = useRouter()
  // Firma de la lista antes de la acción: si no cambia, la revalidación no llegó
  const firma = accesos.map((a) => `${a.id}:${a.estado}`).join(',')
  const [firmaAnterior, setFirmaAnterior] = useState<string | null>(null)

  // Mismo resguardo que en AccionesPropuesta: Next a veces no aplica la revalidación
  // de la acción; si la lista no se actualiza, se recarga la página.
  useEffect(() => {
    if (firmaAnterior === null || firma !== firmaAnterior) return
    const timer = setTimeout(() => window.location.reload(), MS_ESPERA_REFRESCO)
    return () => clearTimeout(timer)
  }, [firma, firmaAnterior])

  // Sin useTransition: si la revalidación no llega, la transición queda pendiente y traba los botones
  const ejecutar = async (accion: () => Promise<{ error: string | null; aviso?: string }>, alTerminar?: () => void, cambiaLista = true) => {
    setMensaje(null)
    setPending(true)
    try {
      const r = await accion()
      if (r.error) return setMensaje({ tipo: 'error', texto: r.error })
      if (r.aviso) setMensaje({ tipo: 'ok', texto: r.aviso })
      alTerminar?.()
      if (cambiaLista) setFirmaAnterior(firma)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-dark-text">Portal de clientes</h2>
          <p className="mt-0.5 text-xs text-dark-text/50">Quienes entran con email y contraseña a ver pagos, saldo, próximas cuotas y propuestas.</p>
        </div>
        {!abierto && (
          <button type="button" onClick={() => setAbierto(true)} className="rounded-lg bg-dark-text px-3.5 py-2 text-xs font-medium text-white transition hover:bg-dark-text/85">
            + Invitar persona
          </button>
        )}
      </header>

      {abierto && (
        <form
          className="space-y-3 border-b border-slate-100 bg-brand-white/60 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault()
            ejecutar(
              () => invitarAcceso(clienteId, nombre, email ?? ''),
              () => {
                setAbierto(false)
                setNombre('')
                setEmail('')
              }
            )
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-dark-text/60">Nombre</span>
              <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className={CLASES_CONTROL} placeholder="Ej: Martín Sima" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-dark-text/60">Email</span>
              <input required type="email" value={email ?? ''} onChange={(e) => setEmail(e.target.value)} className={CLASES_CONTROL} placeholder="nombre@empresa.com" />
            </label>
          </div>
          <p className="text-xs text-dark-text/50">Le llega un email para crear su contraseña (el link vale 7 días). Vos nunca ves su contraseña.</p>
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="rounded-lg bg-dark-text px-4 py-2 text-sm font-medium text-white transition hover:bg-dark-text/85 disabled:opacity-50">
              {pending ? 'Enviando...' : 'Enviar invitación'}
            </button>
            <button type="button" onClick={() => setAbierto(false)} className="px-3 text-sm text-dark-text/60 hover:text-dark-text">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {mensaje && (
        <p role={mensaje.tipo === 'error' ? 'alert' : 'status'} className={`px-5 pt-3 text-xs ${mensaje.tipo === 'error' ? 'text-rose-600' : 'text-brand-forest'}`}>
          {mensaje.texto}
        </p>
      )}

      {accesos.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-dark-text/40">Nadie de este cliente tiene acceso todavía.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {accesos.map((a) => {
            const estado = ESTADOS[a.estado]
            const ultimo = dia(a.ultimoAcceso)
            const invitado = dia(a.invitadoEl)
            return (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-dark-text">
                    {a.nombre}
                    <span className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-medium ${estado.clases}`}>{estado.label}</span>
                  </p>
                  <p className="truncate text-xs text-dark-text/50">
                    {a.email}
                    {a.estado === 'INVITADO' && invitado && ` · invitado ${invitado}`}
                    {a.estado !== 'INVITADO' && (ultimo ? ` · último ingreso ${ultimo}` : ' · todavía no entró')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {a.estado === 'INVITADO' && (
                    <button type="button" disabled={pending} onClick={() => ejecutar(() => reenviarInvitacion(clienteId, a.id), undefined, false)} className={BOTON_CHICO}>
                      Reenviar invitación
                    </button>
                  )}
                  {a.estado === 'DESACTIVADO' ? (
                    <button type="button" disabled={pending} onClick={() => ejecutar(() => cambiarAcceso(clienteId, a.id, true))} className={BOTON_CHICO}>
                      Reactivar
                    </button>
                  ) : (
                    <button type="button" disabled={pending} onClick={() => ejecutar(() => cambiarAcceso(clienteId, a.id, false))} className={BOTON_CHICO}>
                      Desactivar
                    </button>
                  )}
                  <button type="button" onClick={() => setBorrar(a)} className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        abierto={borrar !== null}
        titulo={`¿Eliminar el acceso de ${borrar?.nombre ?? ''}?`}
        mensaje="No va a poder entrar más al portal. Si solo querés cortarle el acceso por un tiempo, desactivalo."
        textoConfirmar="Eliminar"
        pending={pending}
        error={mensaje?.tipo === 'error' ? mensaje.texto : null}
        onConfirmar={() => borrar && ejecutar(() => eliminarAcceso(clienteId, borrar.id), () => setBorrar(null))}
        onCancelar={() => setBorrar(null)}
      />
    </section>
  )
}
