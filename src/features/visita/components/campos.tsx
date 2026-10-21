'use client'

export function Campo({
  label,
  value,
  onChange,
  placeholder,
  multilinea = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multilinea?: boolean
}) {
  return (
    <label className="block">
      <span className="etiqueta">{label}</span>
      {multilinea ? (
        <textarea className="campo min-h-20" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="campo" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

// Lista de textos editada como "uno por linea"
export function CampoLista({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <label className="block">
      <span className="etiqueta">{label}</span>
      <span className="block text-xs text-medio-texto">Uno por línea</span>
      <textarea
        className="campo min-h-24"
        value={value.join('\n')}
        onChange={(e) => onChange(e.target.value.split('\n'))}
      />
    </label>
  )
}
