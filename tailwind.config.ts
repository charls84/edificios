import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en el ladrillo del centro de Bogotá
        ladrillo: { DEFAULT: '#B5523B', oscuro: '#8F3F2C', claro: '#F3E1DA' },
        crema: '#F7F4EF',
        tinta: '#1F2328',
        gris: '#5B6168',
        borde: '#E4DED5',
        musgo: { DEFAULT: '#4F6B4A', claro: '#E2EBDF' },
        ocre: { DEFAULT: '#B8862B', claro: '#F5EAD3' },
      },
    },
  },
  plugins: [],
}

export default config
