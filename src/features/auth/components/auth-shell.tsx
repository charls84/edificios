export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-5">
        <div className="bento flex flex-col justify-between bg-ladrillo text-white md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Edificios</p>
          <div className="mt-10">
            <p className="text-2xl font-bold leading-tight">Ficha de prefactibilidad</p>
            <p className="mt-2 text-sm text-white/80">
              Datos oficiales de cada edificio de Bogotá en un solo lugar.
            </p>
          </div>
        </div>
        <div className="bento md:col-span-3">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-gris">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
