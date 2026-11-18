import { EMPRESA } from '@/lib/empresa'

// Email de contacto clickeable (abre el cliente de correo). Hereda el color del texto que lo rodea.
export const EnlaceEmail = ({ email = EMPRESA.email }: { email?: string }) => (
  <a
    href={`mailto:${email}`}
    className="underline decoration-dark-text/30 underline-offset-2 transition-colors hover:text-dark-text hover:decoration-dark-text"
  >
    {email}
  </a>
)
