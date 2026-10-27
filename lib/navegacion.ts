export type ItemNavegacion = {
  label: string
  href: string
  // path `d` de un ícono outline 24x24
  icono: string
}

export const NAVEGACION: ItemNavegacion[] = [
  {
    label: 'Dashboard',
    href: '/',
    icono: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    label: 'Proyectos',
    href: '/proyectos',
    icono: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    label: 'Pagos',
    href: '/pagos',
    icono: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m0-12a9 9 0 100 18 9 9 0 000-18z',
  },
  {
    label: 'Costos',
    href: '/costos',
    icono: 'M9 14l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    label: 'Gráficos',
    href: '/graficos',
    icono: 'M9 19V6m0 13H6a2 2 0 01-2-2V9a2 2 0 012-2h3m0 12h6m0 0h3a2 2 0 002-2V5a2 2 0 00-2-2h-3a2 2 0 00-2 2v14z',
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icono: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
]
