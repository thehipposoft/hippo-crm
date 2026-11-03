import { PropuestasTable } from '@/components/propuestas/PropuestasTable'
import { SubnavPropuestas } from '@/components/propuestas/SubnavPropuestas'
import { PageHeader } from '@/components/ui/PageHeader'
import { aIso, hoy } from '@/lib/fechas'
import type { PropuestaRow } from '@/lib/types'
import { wpGet } from '@/lib/wp'

export default async function PropuestasPage() {
  const propuestas = await wpGet<PropuestaRow[]>('/propuestas')

  return (
    <div className="px-4 py-8 sm:px-8">
      <PageHeader
        titulo="Propuestas"
        cantidad={propuestas.length}
        singular="documento"
        plural="documentos"
        nuevoHref="/propuestas/nueva?tipo=PROPUESTA"
        nuevoLabel="Nueva propuesta"
        secundario={{ href: '/propuestas/nueva?tipo=COTIZACION', label: 'Nueva cotización' }}
      />
      <SubnavPropuestas activa="/propuestas" />
      <PropuestasTable propuestas={propuestas} hoyIso={aIso(hoy())} />
    </div>
  )
}
