import type { ActionState } from '../types'

export function FormMessage({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-xl bg-ladrillo-claro px-3 py-2 text-sm text-ladrillo-oscuro">
        {state.error}
      </p>
    )
  }
  if (state.success) {
    return (
      <p role="status" className="rounded-xl bg-musgo-claro px-3 py-2 text-sm text-musgo">
        {state.success}
      </p>
    )
  }
  return null
}
