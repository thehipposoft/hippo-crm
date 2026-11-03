// Link inválido o desactivado (bilingüe: no sabemos el idioma del cliente)
export default function LinkInvalido() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-lg font-semibold text-dark-text">Este link no es válido o fue desactivado</h1>
      <p className="mt-1 text-sm text-dark-text/60">This link is invalid or has been disabled.</p>
      <p className="mt-4 text-sm text-dark-text/60">Pedí uno nuevo a quien te lo envió · Please ask for a new one.</p>
    </div>
  )
}
