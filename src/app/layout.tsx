import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { PWARegister } from '@/shared/components/pwa-register'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta')
  return {
    title: t('titulo'),
    description: t('descripcion'),
    robots: { index: false, follow: false },
    applicationName: 'Torna',
    appleWebApp: { capable: true, title: 'Torna', statusBarStyle: 'black-translucent' },
    icons: { apple: '/icons/apple-touch-icon.png' },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: '#0B1F3A',
  width: 'device-width',
  initialScale: 1,
  // Ocupa toda la pantalla en iPhone con notch; los margenes los dan los safe-area insets
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale === 'es' ? 'es-CO' : 'en'} className={inter.className}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <PWARegister />
      </body>
    </html>
  )
}
