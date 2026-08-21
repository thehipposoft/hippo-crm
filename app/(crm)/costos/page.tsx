import Link from 'next/link'
import { cookies } from 'next/headers'
import { wpFetch } from '@/lib/wp'
import { CostosTable } from '@/components/costos/CostosTable'
import type { CostoRow } from '@/lib/types'

export default async function CostosPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hippo_token')?.value

  const costos = await wpFetch<CostoRow[]>('/costos', token)

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-semibold text-dark-text">Costos</h1>
          <p className="mt-0.5 text-sm text-dark-text/50">
            {costos.length} {costos.length === 1 ? 'costo' : 'costos'} en total
          </p>
        </div>

        <Link
          href="/costos/nuevo"
          className="flex items-center gap-2 rounded-lg bg-brand-blue hover:brightness-95 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo costo
        </Link>
      </div>

      <CostosTable costos={costos} />
    </div>
  )
}
