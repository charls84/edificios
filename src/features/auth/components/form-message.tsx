import type { ActionState } from '../types'

export function FormMessage({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-xl bg-rojo-claro px-3 py-2 text-sm text-rojo-oscuro">
        {state.error}
      </p>
    )
  }
  if (state.success) {
    return (
      <p role="status" className="rounded-xl bg-verde-claro px-3 py-2 text-sm text-verde">
        {state.success}
      </p>
    )
  }
  return null
}
