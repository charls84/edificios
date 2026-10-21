import Image from 'next/image'

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
        <div className="bento flex flex-col justify-between border-torna bg-torna text-white md:col-span-2">
          <Image
            src="/brand/torna-logo-oscuro.png"
            alt="Torna Rehabilitación Urbana"
            width={900}
            height={252}
            priority
            className="h-auto w-full max-w-[260px]"
          />
          <div className="mt-10 border-l-2 border-rojo pl-4">
            <p className="text-2xl font-bold leading-tight">Ficha de prefactibilidad</p>
            <p className="mt-2 text-sm text-white/80">
              Datos oficiales de cada edificio de Bogotá en un solo lugar.
            </p>
          </div>
        </div>
        <div className="bento md:col-span-3">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-medio-texto">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
