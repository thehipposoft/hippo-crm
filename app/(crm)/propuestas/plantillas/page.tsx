import Link from 'next/link'
import { BotonEliminar } from '@/components/costos/BotonEliminar'
import { SubnavPropuestas } from '@/components/propuestas/SubnavPropuestas'
import { PageHeader } from '@/components/ui/PageHeader'
import { PLANTILLAS_BASE } from '@/lib/propuestas'
import type { PlantillaRow } from '@/lib/types'
import { wpGetOpcional } from '@/lib/wp'
import { eliminarPlantilla } from './actions'

const TIPO = { PROPUESTA: 'Propuesta', COTIZACION: 'Cotización' } as const

export default async function PlantillasPage() {
  const plantillas = await wpGetOpcional<PlantillaRow[]>('/plantillas', [])

  return (
    <div className="px-4 py-8 sm:px-8">
      <PageHeader titulo="Propuestas" cantidad={plantillas.length} singular="plantilla" plural="plantillas" nuevoHref="/propuestas/plantillas/nueva" nuevoLabel="Nueva plantilla" />
      <SubnavPropuestas activa="/propuestas/plantillas" />

      <div className="grid max-w-4xl gap-3">
        {plantillas.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
            <div className="min-w-0">
              <Link href={`/propuestas/plantillas/${p.id}`} className="font-medium text-dark-text hover:text-brand-blue">
                {p.nombre}
              </Link>
              <p className="text-xs text-dark-text/50">
                {TIPO[p.tipo]} · {p.idioma === 'es' ? 'Español' : 'Inglés'} · {p.secciones.length} secciones · {p.items.length} ítems
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/propuestas/nueva?tipo=${p.tipo}&plantilla=${p.id}`}
                className="rounded-md px-2 py-1 text-xs font-medium text-dark-text/60 transition-colors hover:bg-brand-blue/10 hover:text-dark-text"
              >
                Usar
              </Link>
              <Link
                href={`/propuestas/plantillas/${p.id}`}
                className="rounded-md px-2 py-1 text-xs font-medium text-dark-text/60 transition-colors hover:bg-brand-blue/10 hover:text-dark-text"
              >
                Editar
              </Link>
              <BotonEliminar
                compacto
                accion={eliminarPlantilla.bind(null, p.id)}
                titulo="¿Eliminar esta plantilla?"
                mensaje="Las propuestas que ya se hicieron con ella no cambian."
              />
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-dashed border-slate-300 px-5 py-4">
          <p className="text-sm font-medium text-dark-text">Plantillas base</p>
          <p className="mt-0.5 text-xs text-dark-text/50">
            Siempre disponibles. Para cambiarlas, creá una plantilla nueva (arranca con la base) o guardá una propuesta como plantilla desde su ficha.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLANTILLAS_BASE.map((p) => (
              <Link
                key={p.id}
                href={`/propuestas/nueva?tipo=${p.tipo}&plantilla=${p.id}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-dark-text/70 transition-colors hover:bg-brand-blue/10"
              >
                {TIPO[p.tipo]} · {p.idioma === 'es' ? 'Español' : 'Inglés'}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
