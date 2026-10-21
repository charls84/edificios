import { enterDemo } from '../services/actions'

export function DemoLogin() {
  return (
    <form action={enterDemo} className="space-y-4">
      <p className="rounded-xl bg-piedra px-3 py-2 text-sm text-torna">
        Versión de demostración: incluye el <strong>Edificio Rolher</strong> con su informe de visita real; los demás edificios son <strong>ficticios</strong>.
      </p>
      <button type="submit" className="boton">Entrar al demo</button>
    </form>
  )
}
