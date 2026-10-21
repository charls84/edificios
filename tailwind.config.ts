import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Identidad visual Torna Rehabilitacion Urbana
        torna: { DEFAULT: '#0B1F3A', 700: '#1A3358' }, // Azul Torna: principal, fondos y texto
        rojo: { DEFAULT: '#E50101', oscuro: '#B30000', claro: '#FDECEC' }, // Rojo Torna: acento
        // Azul medio de la paleta; "texto" es la variante con contraste AA para texto pequeno
        medio: { DEFAULT: '#6D7989', texto: '#5B6675' },
        piedra: '#EBEDEF', // Gris piedra: apoyo
        fondo: '#F5F6F8',
        borde: '#DDE1E6',
        // Estados del semaforo (funcionales, fuera de la paleta de marca)
        verde: { DEFAULT: '#2F7D4F', claro: '#E6F2EA' },
        ambar: { DEFAULT: '#8A5A0E', claro: '#FBF1DE' },
      },
    },
  },
  plugins: [],
}

export default config
