'use client'

import Link from 'next/link'
import { TareaCard } from './TareaCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { useParamsUrl } from '@/components/ui/useParamsUrl'
import { parseFecha, type FechaCalendario } from '@/lib/fechas'
import { agruparPorEstado, DIAS_HECHAS_VISIBLES, diasParaVencer, filtrarTareas } from '@/lib/tareas'
import { ESTADOS_TAREA, type EstadoTarea, type TareaRow, type UsuarioRow } from '@/lib/types'

const COLOR_ESTADO: Record<EstadoTarea, string> = {
  PENDIENTE: 'bg-slate-400',
  EN_CURSO: 'bg-brand-blue',
  BLOQUEADA: 'bg-rose-500',
  HECHA: 'bg-emerald-500',
}

const VACIO_ESTADO: Record<EstadoTarea, string> = {
  PENDIENTE: 'Nada pendiente.',
  EN_CURSO: 'Nadie está trabajando en algo.',
  BLOQUEADA: 'Nada bloqueado.',
  HECHA: 'Todavía nada terminado.',
}

// Valor del filtro de responsable en la URL: id, 'sin' (sin asignar) o ausente (todos)
const SIN_ASIGNAR = 'sin'

interface TareasBoardProps {
  tareas: TareaRow[]
  usuarios: UsuarioRow[]
  // 'YYYY-MM-DD' de hoy, del server (mismo cálculo en server y navegador)
  hoyIso: string
  miUsuarioId: number | null
}

export const TareasBoard = ({ tareas, usuarios, hoyIso, miUsuarioId }: TareasBoardProps) => {
  const params = useParamsUrl()
  const fechaHoy = parseFecha(hoyIso) as FechaCalendario

  const resp = params.get('resp')
  const responsableId = resp === SIN_ASIGNAR ? 0 : resp ? Number(resp) : null
  const texto = params.get('q') ?? ''
  const verHechasViejas = params.get('hechas') === '1'

  const grupos = agruparPorEstado(filtrarTareas(tareas, { responsableId, texto, verHechasViejas }, fechaHoy))

  const chips: { valor: string | null; label: string }[] = [
    { valor: null, label: 'Todas' },
    ...(miUsuarioId ? [{ valor: String(miUsuarioId), label: 'Mías' }] : []),
    ...usuarios.filter((u) => u.id !== miUsuarioId).map((u) => ({ valor: String(u.id), label: u.nombre.split(/\s+/)[0] })),
    { valor: SIN_ASIGNAR, label: 'Sin asignar' },
  ]

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {chips.map(({ valor, label }) => (
            <button
              key={valor ?? 'todas'}
              type="button"
              onClick={() => params.set({ resp: valor })}
              aria-pressed={resp === valor}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                resp === valor
                  ? 'bg-brand-blue text-white'
                  : 'border border-slate-200 bg-white text-dark-text/60 hover:bg-brand-blue/10 hover:text-dark-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-dark-text/60">
            <input
              type="checkbox"
              checked={verHechasViejas}
              onChange={(e) => params.set({ hechas: e.target.checked ? '1' : null })}
              className="accent-brand-blue"
            />
            Hechas de más de {DIAS_HECHAS_VISIBLES} días
          </label>
          <SearchInput value={texto} onChange={(valor) => params.set({ q: valor })} placeholder="Buscar tareas..." />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ESTADOS_TAREA.map(({ value, label }) => (
          <section key={value} aria-label={label} className="flex flex-col rounded-xl bg-slate-100/70 p-3">
            <header className="mb-3 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-text/70">
                <span className={`h-2 w-2 rounded-full ${COLOR_ESTADO[value]}`} aria-hidden />
                {label}
              </h2>
              <span className="text-xs font-medium text-dark-text/40">{grupos[value].length}</span>
            </header>
            <div className="space-y-2.5">
              {grupos[value].length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-dark-text/40">{VACIO_ESTADO[value]}</p>
              ) : (
                grupos[value].map((t) => <TareaCard key={t.id} tarea={t} dias={diasParaVencer(t, fechaHoy)} />)
              )}
              {value === 'PENDIENTE' && (
                <Link
                  href="/tareas/nueva"
                  className="block rounded-lg border border-dashed border-slate-300 px-3 py-2 text-center text-xs font-medium text-dark-text/50 transition-colors hover:border-brand-blue hover:text-brand-blue"
                >
                  + Agregar tarea
                </Link>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
