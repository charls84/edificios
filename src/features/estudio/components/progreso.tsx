export function Progreso({ label, valor, total, destacado = false }: { label: string; valor: number; total: number; destacado?: boolean }) {
  const pct = total === 0 ? 0 : Math.round((valor / total) * 100)
  const completo = total > 0 && valor >= total
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className={destacado ? 'font-semibold' : ''}>{label}</span>
        <span className="text-medio-texto">{valor} / {total}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-piedra" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full transition-all ${completo ? 'bg-verde' : destacado ? 'bg-rojo' : 'bg-torna'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
