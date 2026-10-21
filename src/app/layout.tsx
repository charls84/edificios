import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Torna · Ficha de prefactibilidad',
  description: 'Herramienta interna para evaluar el potencial de rehabilitación de edificios en Bogotá',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
