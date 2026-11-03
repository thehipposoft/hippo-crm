import { compararFechas, hoy, parseFecha, type FechaCalendario } from './fechas'
import type {
  CuentaBancariaRow,
  EstadoPropuesta,
  IdiomaDocumento,
  ItemPropuesta,
  Moneda,
  PlantillaRow,
  PropuestaRow,
  SeccionPropuesta,
  TipoPropuesta,
} from './types'

const CENTAVOS = 100
const DIGITOS_NUMERO = 6
export const DIAS_VALIDEZ_POR_DEFECTO = 15

const redondear = (valor: number): number => Math.round(valor * CENTAVOS) / CENTAVOS

// ==== Totales ====

export const subtotalItem = (item: Pick<ItemPropuesta, 'cantidad' | 'precio'>): number =>
  redondear(item.cantidad * item.precio)

export type Totales = { subtotal: number; descuento: number; total: number }

// El descuento nunca deja el total en negativo
export const totalesPropuesta = (items: ItemPropuesta[], descuento = 0): Totales => {
  const subtotal = redondear(items.reduce((suma, item) => suma + subtotalItem(item), 0))
  const aplicado = redondear(Math.min(Math.max(descuento, 0), subtotal))
  return { subtotal, descuento: aplicado, total: redondear(subtotal - aplicado) }
}

// ==== Número y estado ====

const PREFIJO: Record<TipoPropuesta, string> = { PROPUESTA: 'P', COTIZACION: 'C' }

// "P-000123" / "C-000123": el número es el ID en WordPress
export const numeroPropuesta = (propuesta: Pick<PropuestaRow, 'id' | 'tipo'>): string =>
  `${PREFIJO[propuesta.tipo]}-${String(propuesta.id).padStart(DIGITOS_NUMERO, '0')}`

// Estado que se muestra: una enviada que pasó su fecha está VENCIDA
export type EstadoVisible = EstadoPropuesta | 'VENCIDA'

export const estaVencida = (
  propuesta: Pick<PropuestaRow, 'fechaVencimiento'>,
  fechaHoy: FechaCalendario = hoy()
): boolean => {
  const vence = parseFecha(propuesta.fechaVencimiento)
  return vence !== null && compararFechas(vence, fechaHoy) < 0
}

export const estadoVisible = (
  propuesta: Pick<PropuestaRow, 'estado' | 'fechaVencimiento'>,
  fechaHoy: FechaCalendario = hoy()
): EstadoVisible => (propuesta.estado === 'ENVIADA' && estaVencida(propuesta, fechaHoy) ? 'VENCIDA' : propuesta.estado)

export const ESTADOS_VISIBLES: { value: EstadoVisible; label: string }[] = [
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'ACEPTADA', label: 'Aceptada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
  { value: 'VENCIDA', label: 'Vencida' },
]

export const labelEstadoPropuesta = (estado: EstadoVisible): string =>
  ESTADOS_VISIBLES.find((e) => e.value === estado)?.label ?? estado

// Abiertas = esperando respuesta del cliente
export const propuestasAbiertas = (propuestas: PropuestaRow[], fechaHoy: FechaCalendario = hoy()): PropuestaRow[] =>
  propuestas.filter((p) => estadoVisible(p, fechaHoy) === 'ENVIADA')

// Cuentas que se tildan solas al crear: las de la moneda del documento (o sin moneda)
export const cuentasSugeridas = (cuentas: CuentaBancariaRow[], moneda: Moneda): number[] =>
  cuentas.filter((c) => c.moneda === moneda).map((c) => c.id)

export const rutaPublicaPropuesta = (token: string): string => `/propuesta/${token}`

// ==== Plantillas base (siempre disponibles, además de las guardadas en WordPress) ====

export type PlantillaBase = Omit<PlantillaRow, 'id'> & { id: string }

const item = (descripcion: string, precio: number, plazo: string | null = null, detalle: string | null = null): ItemPropuesta => ({
  descripcion,
  detalle,
  plazo,
  cantidad: 1,
  precio,
})

const SECCIONES_PROPUESTA: Record<IdiomaDocumento, SeccionPropuesta[]> = {
  es: [
    {
      titulo: 'Propuesta inicial',
      contenido:
        'Describí en uno o dos párrafos qué se va a hacer y para qué.\n\nEj.: Desarrollo de un nuevo sitio web institucional que muestre la empresa, sus servicios y proyectos, y facilite el contacto con potenciales clientes.',
    },
    {
      titulo: 'Objetivos del proyecto',
      contenido:
        '- **Mejorar la presentación con el público:** comunicar de forma clara qué hace la empresa.\n- **Generar consultas:** formularios y accesos directos a WhatsApp.\n- **Autonomía:** que el equipo pueda actualizar el contenido sin depender de soporte técnico.',
    },
    {
      titulo: 'Alcance',
      contenido:
        '### Diseño UX/UI\nDiseño a medida, alineado a la identidad de la marca, en versión escritorio y mobile. Se contemplan dos rondas de revisión.\n\n### Desarrollo\n- Sitio responsive y optimizado para buscadores (SEO básico).\n- Panel de administración autogestionable.\n- Formulario de contacto conectado al email.\n\n### Puesta en producción\nPublicación en el dominio del cliente, configuración del hosting y una sesión de capacitación.',
    },
    {
      titulo: 'Etapas y plazos',
      contenido:
        '| Etapa | Tiempo | Entregables |\n|---|---|---|\n| Definición de objetivos | 1 semana | Documento de requisitos |\n| Diseño | 2 semanas | Prototipo en Figma |\n| Desarrollo | 4 semanas | Sitio funcional en un entorno de pruebas |\n| Puesta en producción | 1 día | Sitio publicado |',
    },
    {
      titulo: 'No incluido en este alcance',
      contenido:
        'Producción de fotografía o video, redacción de contenidos, diseño de logotipo, campañas de publicidad y costos de dominio y hosting, salvo que se acuerde lo contrario.',
    },
    {
      titulo: 'Observaciones',
      contenido:
        '- Los pagos se realizan antes de comenzar cada etapa.\n- El contenido (textos, imágenes y videos) lo provee el cliente.\n- Cada entregable es propiedad 100% del cliente.\n- En caso de necesitar factura se agrega el IVA al monto acordado.',
    },
  ],
  en: [
    {
      titulo: 'Overview',
      contenido:
        'Describe in one or two paragraphs what will be built and why.\n\nE.g.: A new corporate website that presents the company, its services and projects, and makes it easy for potential clients to get in touch.',
    },
    {
      titulo: 'Project goals',
      contenido:
        '- **Clear positioning:** communicate what the company does at a glance.\n- **More enquiries:** contact forms and direct WhatsApp access.\n- **Autonomy:** the team can update content without technical support.',
    },
    {
      titulo: 'Scope',
      contenido:
        '### UX/UI design\nCustom design aligned with the brand identity, for desktop and mobile. Includes two rounds of revisions.\n\n### Development\n- Responsive, search-engine-friendly website (basic SEO).\n- Self-managed admin panel.\n- Contact form connected to email.\n\n### Launch\nDeployment to the client domain, hosting setup and one training session.',
    },
    {
      titulo: 'Timeline',
      contenido:
        '| Phase | Time | Deliverables |\n|---|---|---|\n| Discovery | 1 week | Requirements document |\n| Design | 2 weeks | Figma prototype |\n| Development | 4 weeks | Working site on a staging environment |\n| Launch | 1 day | Live site |',
    },
    {
      titulo: 'Out of scope',
      contenido:
        'Photography or video production, copywriting, logo design, advertising campaigns, and domain and hosting costs, unless agreed otherwise.',
    },
    {
      titulo: 'Terms',
      contenido:
        '- Payments are made before each phase starts.\n- Content (copy, images and videos) is provided by the client.\n- All deliverables are 100% owned by the client.',
    },
  ],
}

const ITEMS_PROPUESTA: Record<IdiomaDocumento, ItemPropuesta[]> = {
  es: [item('Diseño del sitio', 0, '1 mes'), item('Desarrollo', 0, '2 meses'), item('Hosting (anual)', 0, null, 'Incluye certificado SSL y backups automáticos.')],
  en: [item('Website design', 0, '1 month'), item('Development', 0, '2 months'), item('Hosting (yearly)', 0, null, 'Includes SSL certificate and automatic backups.')],
}

const NOTAS: Record<TipoPropuesta, Record<IdiomaDocumento, string>> = {
  PROPUESTA: {
    es: 'Los plazos son estimados y pueden variar en función de la respuesta del cliente.',
    en: 'Timeframes are estimates and may vary depending on client feedback.',
  },
  COTIZACION: {
    es: 'Pago por transferencia bancaria antes de la fecha de vencimiento.',
    en: 'Payment by bank transfer before the due date.',
  },
}

export const plantillaBase = (tipo: TipoPropuesta, idioma: IdiomaDocumento): PlantillaBase => ({
  id: `base-${tipo}-${idioma}`,
  nombre: idioma === 'es' ? 'Plantilla base' : 'Plantilla base (inglés)',
  tipo,
  idioma,
  secciones: tipo === 'PROPUESTA' ? SECCIONES_PROPUESTA[idioma] : [],
  items: tipo === 'PROPUESTA' ? ITEMS_PROPUESTA[idioma] : [item('', 0)],
  notas: NOTAS[tipo][idioma],
})

export const PLANTILLAS_BASE: PlantillaBase[] = (['PROPUESTA', 'COTIZACION'] as const).flatMap((tipo) =>
  (['es', 'en'] as const).map((idioma) => plantillaBase(tipo, idioma))
)

// Opción del selector de plantilla: las guardadas (clave = id) y las base (clave = 'base-…')
export type OpcionPlantilla = (PlantillaBase | PlantillaRow) & { clave: string }

export const ITEM_VACIO: ItemPropuesta = item('', 0)
