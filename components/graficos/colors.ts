import type { Estado, Moneda } from '@/lib/types'

export const COLOR_MONEDA: Record<Moneda, string> = {
  USD: '#2a78d6',
  ARS: '#eb6834',
  AUD: '#1baf7a',
  EUR: '#eda100',
}

export const COLOR_ESTADO: Record<Estado, string> = {
  PROSPECTO: '#2a78d6',
  EN_NEGOCIACION: '#eb6834',
  ACTIVO: '#1baf7a',
  EN_PAUSA: '#eda100',
  CERRADO: '#e87ba4',
  PERDIDO: '#008300',
}
