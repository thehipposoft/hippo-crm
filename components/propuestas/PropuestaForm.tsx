'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { Campo, FilaCampos, Formulario, Input, Select, Textarea } from '@/components/ui/Formulario'
import { aInputFecha } from '@/lib/format'
import type { AccionFormulario } from '@/lib/formularios'
import { cuentasSugeridas, plantillaBase, type OpcionPlantilla } from '@/lib/propuestas'
import {
  MONEDA_POR_DEFECTO,
  MONEDAS,
  TIPOS_PROPUESTA,
  type ClienteRow,
  type CuentaBancariaRow,
  type IdiomaDocumento,
  type ItemPropuesta,
  type Moneda,
  type PropuestaRow,
  type ProyectoRow,
  type SeccionPropuesta,
  type TipoPropuesta,
} from '@/lib/types'
import { EditorItems } from './EditorItems'
import { EditorSecciones } from './EditorSecciones'

interface PropuestaFormProps {
  accion: AccionFormulario
  textoBoton: string
  clientes: ClienteRow[]
  proyectos: ProyectoRow[]
  cuentas: CuentaBancariaRow[]
  // Solo en el alta
  plantillas?: OpcionPlantilla[]
  propuesta?: PropuestaRow
  inicial?: { tipo?: TipoPropuesta; clienteId?: string; proyectoId?: string; plantilla?: string }
  fechaHoy: string
  vencimientoSugerido: string
}

const IDIOMAS: { value: IdiomaDocumento; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
]

const Bloque = ({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: ReactNode }) => (
  <fieldset className="rounded-2xl border border-slate-200 bg-white/60 p-4 sm:p-6">
    <legend className="px-1 text-sm font-semibold text-dark-text">{titulo}</legend>
    {ayuda && <p className="-mt-1 mb-4 text-xs text-dark-text/50">{ayuda}</p>}
    <div className="space-y-4">{children}</div>
  </fieldset>
)

export const PropuestaForm = ({
  accion,
  textoBoton,
  clientes,
  proyectos,
  cuentas,
  plantillas = [],
  propuesta,
  inicial,
  fechaHoy,
  vencimientoSugerido,
}: PropuestaFormProps) => {
  const esAlta = !propuesta
  const plantillaInicial =
    plantillas.find((p) => p.clave === inicial?.plantilla) ?? plantillas.find((p) => p.tipo === (inicial?.tipo ?? 'PROPUESTA'))
  const base = propuesta ?? plantillaInicial ?? plantillaBase(inicial?.tipo ?? 'PROPUESTA', 'es')
  const monedaInicial: Moneda = propuesta?.moneda ?? MONEDA_POR_DEFECTO

  const [tipo, setTipo] = useState<TipoPropuesta>(base.tipo)
  const [idioma, setIdioma] = useState<IdiomaDocumento>(base.idioma)
  const [plantillaClave, setPlantillaClave] = useState(plantillaInicial?.clave ?? '')
  const [secciones, setSecciones] = useState<SeccionPropuesta[]>(base.secciones)
  const [items, setItems] = useState<ItemPropuesta[]>(base.items)
  const [notas, setNotas] = useState(base.notas ?? '')
  const [moneda, setMoneda] = useState<Moneda>(monedaInicial)
  const [descuento, setDescuento] = useState(propuesta?.descuento ? String(propuesta.descuento) : '')
  const [clienteId, setClienteId] = useState(String(propuesta?.clienteId ?? inicial?.clienteId ?? ''))
  const [cuentasSel, setCuentasSel] = useState<number[]>(propuesta?.cuentas ?? cuentasSugeridas(cuentas, monedaInicial))
  const [cuentasTocadas, setCuentasTocadas] = useState(!esAlta)
  // Si el contenido se editó, cambiar de plantilla pide confirmación
  const [contenidoTocado, setContenidoTocado] = useState(!esAlta)

  const aplicarPlantilla = (clave: string) => {
    const plantilla = plantillas.find((p) => p.clave === clave)
    if (!plantilla) return
    if (contenidoTocado && !window.confirm('Se reemplazan las secciones, los ítems y las condiciones por los de la plantilla. ¿Seguimos?')) return
    setPlantillaClave(clave)
    setTipo(plantilla.tipo)
    setIdioma(plantilla.idioma)
    setSecciones(plantilla.secciones)
    setItems(plantilla.items)
    setNotas(plantilla.notas ?? '')
    setContenidoTocado(false)
  }

  const cambiarTipo = (nuevo: TipoPropuesta) => {
    setTipo(nuevo)
    // En un alta sin tocar, arranca con la primera plantilla de ese tipo
    const plantilla = plantillas.find((p) => p.tipo === nuevo && p.idioma === idioma) ?? plantillas.find((p) => p.tipo === nuevo)
    if (esAlta && !contenidoTocado && plantilla) aplicarPlantilla(plantilla.clave)
    else setPlantillaClave('')
  }

  const cambiarMoneda = (nueva: Moneda) => {
    setMoneda(nueva)
    if (!cuentasTocadas) setCuentasSel(cuentasSugeridas(cuentas, nueva))
  }

  const alternarCuenta = (id: number) => {
    setCuentasTocadas(true)
    setCuentasSel((actual) => (actual.includes(id) ? actual.filter((c) => c !== id) : [...actual, id]))
  }

  const conContenido = <T,>(setter: (valor: T) => void) => (valor: T) => {
    setter(valor)
    setContenidoTocado(true)
  }

  const proyectosDelCliente = proyectos.filter((p) => String(p.clienteId) === clienteId)
  const esPropuesta = tipo === 'PROPUESTA'
  const descuentoNumero = Number(descuento.replace(',', '.')) || 0

  return (
    <Formulario accion={accion} textoBoton={textoBoton}>
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="secciones" value={JSON.stringify(secciones)} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="cuentas" value={JSON.stringify(cuentasSel)} />

      <div className="space-y-6">
        <Bloque titulo="Datos">
          <div className="flex flex-wrap items-end gap-4">
            <div role="radiogroup" aria-label="Tipo de documento" className="flex rounded-lg border border-slate-200 bg-white p-0.5">
              {TIPOS_PROPUESTA.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={tipo === t.value}
                  onClick={() => cambiarTipo(t.value)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    tipo === t.value ? 'bg-dark-text text-white' : 'text-dark-text/60 hover:text-dark-text'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {esAlta && plantillas.length > 0 && (
              <div className="min-w-56 flex-1">
                <label htmlFor="plantilla" className="mb-1.5 block text-xs font-medium text-dark-text/60">
                  Plantilla
                </label>
                <select
                  id="plantilla"
                  value={plantillaClave}
                  onChange={(e) => aplicarPlantilla(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="" disabled>
                    Elegí una plantilla
                  </option>
                  {plantillas
                    .filter((p) => p.tipo === tipo)
                    .map((p) => (
                      <option key={p.clave} value={p.clave}>
                        {p.nombre}
                        {p.idioma === 'en' && !p.nombre.toLowerCase().includes('ingl') ? ' (inglés)' : ''}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <Campo nombre="titulo" label="Título *">
            <Input
              name="titulo"
              required
              defaultValue={propuesta?.titulo}
              placeholder={esPropuesta ? 'Ej: Nuevo sitio web institucional' : 'Ej: Actualizaciones del sitio'}
            />
          </Campo>

          <FilaCampos>
            <Campo nombre="cliente_id" label="Cliente *">
              <Select name="cliente_id" required value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="" disabled>
                  Elegí un cliente
                </option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo nombre="proyecto_id" label="Proyecto">
              <Select name="proyecto_id" defaultValue={propuesta?.proyectoId ?? inicial?.proyectoId ?? ''} key={clienteId}>
                <option value="">Sin proyecto</option>
                {proyectosDelCliente.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Select>
            </Campo>
          </FilaCampos>

          <Campo
            nombre="resumen"
            label={esPropuesta ? 'Bajada de la portada' : 'Referencia'}
            ayuda={esPropuesta ? 'Una o dos líneas debajo del título.' : 'Opcional: aparece debajo del título.'}
          >
            <Textarea name="resumen" rows={2} defaultValue={propuesta?.resumen ?? ''} />
          </Campo>

          <FilaCampos>
            <Campo nombre="idioma" label="Idioma del documento">
              <Select name="idioma" value={idioma} onChange={(e) => setIdioma(e.target.value as IdiomaDocumento)}>
                {IDIOMAS.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo nombre="moneda" label="Moneda">
              <Select name="moneda" value={moneda} onChange={(e) => cambiarMoneda(e.target.value as Moneda)}>
                {MONEDAS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo nombre="fecha" label="Fecha *">
              <Input name="fecha" type="date" required defaultValue={aInputFecha(propuesta?.fecha) || fechaHoy} />
            </Campo>
            <Campo nombre="fecha_vencimiento" label={esPropuesta ? 'Válida hasta' : 'Vencimiento'}>
              <Input
                name="fecha_vencimiento"
                type="date"
                defaultValue={propuesta ? aInputFecha(propuesta.fechaVencimiento) : vencimientoSugerido}
              />
            </Campo>
          </FilaCampos>
        </Bloque>

        <Bloque
          titulo="Secciones"
          ayuda={
            esPropuesta
              ? 'Van numeradas antes de la inversión. Agregá, reordená o sacá las que necesites.'
              : 'Opcional en una cotización: van antes del detalle de ítems.'
          }
        >
          <Campo nombre="secciones" label="">
            <EditorSecciones secciones={secciones} onChange={conContenido(setSecciones)} />
          </Campo>
        </Bloque>

        <Bloque titulo={esPropuesta ? 'Inversión' : 'Ítems'}>
          <Campo nombre="items" label="">
            <EditorItems items={items} onChange={conContenido(setItems)} moneda={moneda} descuento={descuentoNumero} />
          </Campo>
          <div className="max-w-48">
            <Campo nombre="descuento" label="Descuento (monto)">
              <Input
                name="descuento"
                type="number"
                min="0"
                step="0.01"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                placeholder="0"
              />
            </Campo>
          </div>
        </Bloque>

        <Bloque titulo="Pago y condiciones">
          <div>
            <p className="mb-1.5 text-xs font-medium text-dark-text/60">Datos bancarios que se muestran</p>
            {cuentas.length === 0 ? (
              <p className="text-sm text-dark-text/50">
                No hay cuentas cargadas.{' '}
                <Link href="/propuestas/cuentas/nueva" className="font-medium text-dark-text underline decoration-brand-blue underline-offset-2">
                  Agregar una
                </Link>
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {cuentas.map((c) => (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                      cuentasSel.includes(c.id) ? 'border-dark-text bg-white' : 'border-slate-200 bg-white/60 hover:border-slate-300'
                    }`}
                  >
                    <input type="checkbox" checked={cuentasSel.includes(c.id)} onChange={() => alternarCuenta(c.id)} className="mt-0.5 accent-dark-text" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-dark-text">
                        {c.nombre}
                        {c.moneda && <span className="ml-1.5 text-xs font-normal text-dark-text/50">{c.moneda}</span>}
                      </span>
                      <span className="line-clamp-2 whitespace-pre-line text-xs text-dark-text/50">{c.detalle}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <Campo nombre="notas" label="Condiciones" ayuda="Al pie del documento. Acepta el mismo formato que las secciones.">
            <Textarea name="notas" rows={3} value={notas} onChange={(e) => conContenido(setNotas)(e.target.value)} />
          </Campo>
        </Bloque>
      </div>
    </Formulario>
  )
}
