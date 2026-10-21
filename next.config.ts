import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Activa el MCP server en /_next/mcp (Next.js 16+)
  experimental: {
    mcpServer: true,
  },
  async redirects() {
    // El Ejemplo A del demo paso a ser el Edificio Rolher (datos reales de la visita)
    return [{ source: '/edificios/ejemplo-a', destination: '/edificios/rolher', permanent: false }]
  },
}

export default withNextIntl(nextConfig)
