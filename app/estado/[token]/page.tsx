import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BotonImprimir } from '@/components/documentos/BotonImprimir'
import { EstadoDeCuentaDoc } from '@/components/documentos/EstadoDeCuentaDoc'
import { ServiciosEstado } from '@/components/documentos/ServiciosEstado'
import { HistorialPagos, ResumenEstado, SeccionEstado } from '@/components/documentos/VistaEstado'
import { EMPRESA } from '@/lib/empresa'
import { armarEstadoDeCuenta } from '@/lib/documentos/estadoDeCuenta'
import { fechaDoc, IDIOMAS, idiomaPara, TEXTOS } from '@/lib/documentos/idioma'
import { armarServicios } from '@/lib/documentos/servicios'
import { TEXTOS_SERVICIOS } from '@/lib/documentos/textosServicios'
import { hoy } from '@/lib/fechas'
import { proximosPagos } from '@/lib/portal/portal'
import { obtenerEstadoPublico } from '@/lib/publico'
import { EnlaceEmail } from '@/components/ui/EnlaceEmail'

// En pantalla: vista interactiva por servicio. Al imprimir / PDF: el documento formal.
export default async function EstadoPublicoPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ idioma?: string }>
}) {
  const [{ token }, { idioma: pedido }] = await Promise.all([params, searchParams])
  const datos = await obtenerEstadoPublico(token)
  if (!datos) notFound()

  const fechaHoy = hoy()
  const idioma = idiomaPara(datos.cliente.pais, pedido)
  const t = TEXTOS_SERVICIOS[idioma]
  const td = TEXTOS[idioma]
  const estado = armarEstadoDeCuenta(datos.proyectos, datos.pagos, fechaHoy)
  const servicios = armarServicios(estado, datos.propuestasProyectos)
  const rutaRecibo = `/estado/${token}/recibo/:id?idioma=${idioma}`

  return (
    <>
      <div className="pb-16 print:hidden">
        <header className="bg-dark-text text-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
            <div className="flex items-end gap-2">
              <Image src={EMPRESA.logoBlanco} alt={EMPRESA.nombre} width={84} height={21} priority />
              <span className="hidden text-[11px] font-medium uppercase tracking-[0.2em] text-white/50 sm:inline">{td.estadoDeCuenta}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-white/20 text-xs font-medium">
                {IDIOMAS.map((opcion) => (
                  <Link
                    key={opcion}
                    href={`/estado/${token}?idioma=${opcion}`}
                    replace
                    aria-current={opcion === idioma ? 'true' : undefined}
                    className={`px-2.5 py-1.5 uppercase transition-colors ${opcion === idioma ? 'bg-white text-dark-text' : 'text-white/70 hover:bg-white/10'}`}
                  >
                    {opcion}
                  </Link>
                ))}
              </div>
              <BotonImprimir className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-dark-text transition hover:bg-white/90">
                {td.descargarPdf}
              </BotonImprimir>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 sm:px-8">
          <div className="pt-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-text/50">{datos.cliente.nombre}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {td.estadoDeCuenta}
              <span className="ml-1 inline-block h-[0.2em] w-[0.2em] bg-brand-blue" aria-hidden />
            </h1>
            <p className="mt-1 text-sm text-dark-text/50">
              {t.actualizado} {fechaDoc(fechaHoy, idioma)}
            </p>
          </div>

          <div className="mt-8">
            <ResumenEstado estado={estado} proximos={proximosPagos(estado)} idioma={idioma} />
          </div>

          <SeccionEstado titulo={t.servicios}>
            <ServiciosEstado servicios={servicios} idioma={idioma} rutaRecibo={rutaRecibo} />
          </SeccionEstado>

          <HistorialPagos servicios={servicios} idioma={idioma} rutaRecibo={rutaRecibo} />

          <footer className="mt-14 border-t border-slate-200 pt-5 text-xs text-dark-text/50">
            {td.consultas}: <EnlaceEmail /> · {EMPRESA.web}
          </footer>
        </main>
      </div>

      <div className="hidden print:block">
        <EstadoDeCuentaDoc
          cliente={datos.cliente}
          estado={estado}
          idioma={idioma}
          fechaEmision={fechaHoy}
          hrefRecibo={(pagoId) => `/estado/${token}/recibo/${pagoId}?idioma=${idioma}`}
        />
      </div>
    </>
  )
}
