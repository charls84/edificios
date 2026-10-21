import type { NextConfig } from 'next'

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

export default nextConfig
