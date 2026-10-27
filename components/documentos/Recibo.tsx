import { fechaDoc, medioDoc, montoDoc, numeroRecibo, TEXTOS, type Idioma } from '@/lib/documentos/idioma'
import type { ClientePublico, PagoRow, ProyectoRow } from '@/lib/types'
import { Etiqueta, HojaDocumento } from './HojaDocumento'

interface ReciboProps {
  pago: PagoRow
  proyecto: Pick<ProyectoRow, 'nombre'> | null
  cliente: ClientePublico | null
  idioma: Idioma
}

// Las notas del pago son internas: no van en el recibo
export const Recibo = ({ pago, proyecto, cliente, idioma }: ReciboProps) => {
  const t = TEXTOS[idioma]
  const concepto = `${t.pagoDe} — ${proyecto?.nombre ?? pago.proyectoNombre ?? ''}`

  return (
    <HojaDocumento
      idioma={idioma}
      titulo={t.recibo}
      datos={
        <>
          <p>
            {t.reciboNumero} <span className="font-medium text-dark-text">{numeroRecibo(pago.id)}</span>
          </p>
          <p>
            {t.fecha}: <span className="font-medium text-dark-text">{fechaDoc(pago.fecha, idioma)}</span>
          </p>
        </>
      }
      pie={<p>{t.noFactura}</p>}
    >
      <section className="mb-8">
        <Etiqueta>{t.recibimosDe}</Etiqueta>
        <p className="text-base font-semibold">{cliente?.nombre ?? pago.clienteNombre ?? '—'}</p>
        <div className="text-xs leading-relaxed text-dark-text/60">
          {cliente?.contacto && <p>{cliente.contacto}</p>}
          {cliente?.emailContacto && <p>{cliente.emailContacto}</p>}
          {cliente?.pais && <p>{cliente.pais}</p>}
        </div>
      </section>

      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-dark-text/50">
            <th className="py-2 pr-4 font-medium">{t.concepto}</th>
            <th className="py-2 pr-4 font-medium">{t.medioDePago}</th>
            <th className="py-2 text-right font-medium">{t.importe}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <td className="py-3 pr-4">{concepto}</td>
            <td className="py-3 pr-4 text-dark-text/70">{medioDoc(pago.medioPago, idioma)}</td>
            <td className="whitespace-nowrap py-3 text-right tabular-nums">{montoDoc(pago.monto, pago.moneda, idioma)}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="rounded-lg bg-brand-white px-5 py-3 text-right print:border print:border-slate-200">
          <p className="text-xs uppercase tracking-wider text-dark-text/50">{t.total}</p>
          <p className="text-xl font-semibold tabular-nums">{montoDoc(pago.monto, pago.moneda, idioma)}</p>
        </div>
      </div>

      <p className="mt-10 text-sm text-dark-text/70">{t.gracias}</p>
    </HojaDocumento>
  )
}
