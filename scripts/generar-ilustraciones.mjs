// Genera ilustraciones SVG de fachadas para el modo demostracion (estilo linea del logo Torna).
// Uso: node scripts/generar-ilustraciones.mjs  -> public/demo/edificios/*.svg
import { mkdirSync, writeFileSync } from 'node:fs'

const AZUL = '#0B1F3A'
const ROJO = '#E50101'
const W = 1200
const H = 675
const OUT = 'public/demo/edificios'

const EDIFICIOS = {
  'ejemplo-a': { pisos: 6, vanos: 5, muro: '#F4EFE6', balcones: true, arcos: true },
  'ejemplo-b': { pisos: 3, vanos: 4, muro: '#EEF0F3', balcones: true, arcos: false },
  'ejemplo-c': { pisos: 4, vanos: 3, muro: '#EDE7E1', balcones: false, arcos: true },
  'ejemplo-d': { pisos: 5, vanos: 4, muro: '#F2F0EA', balcones: true, arcos: true },
}

function ventana(x, y, w, h, color, arco) {
  const top = arco
    ? `<path d="M${x} ${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}" fill="none" stroke="${color}" stroke-width="3"/>
       <line x1="${x}" y1="${y + w / 2}" x2="${x}" y2="${y + h}" stroke="${color}" stroke-width="3"/>
       <line x1="${x + w}" y1="${y + w / 2}" x2="${x + w}" y2="${y + h}" stroke="${color}" stroke-width="3"/>`
    : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${color}" stroke-width="3"/>
       <rect x="${x - 6}" y="${y - 10}" width="${w + 12}" height="6" fill="${color}"/>`
  const vidrio = `<rect x="${x + 6}" y="${y + (arco ? w / 2 : 6)}" width="${w - 12}" height="${h - (arco ? w / 2 : 6) - 6}" fill="${color}" opacity="0.12"/>`
  return top + vidrio
}

function baranda(x, y, w, h, color) {
  let s = `<line x1="${x - 8}" y1="${y}" x2="${x + w + 8}" y2="${y}" stroke="${color}" stroke-width="3"/>
           <line x1="${x - 8}" y1="${y + h}" x2="${x + w + 8}" y2="${y + h}" stroke="${color}" stroke-width="3"/>`
  for (let i = x - 4; i <= x + w + 4; i += 8) s += `<line x1="${i}" y1="${y}" x2="${i}" y2="${y + h}" stroke="${color}" stroke-width="1.6"/>`
  return s
}

// Fachada completa; la mitad derecha en rojo (lo que se rehabilita), como el logo.
function fachada(e, ox, oy, ancho) {
  // Cabe en un recorte 16:7 anclado abajo (franja visible de ~525 px)
  const altoPiso = Math.min(78, 330 / e.pisos)
  const alto = e.pisos * altoPiso + 40
  const top = oy - alto
  const mitad = ox + ancho / 2
  let s = `<rect x="${ox}" y="${top}" width="${ancho}" height="${alto}" fill="${e.muro}"/>`
  s += `<rect x="${ox - 14}" y="${top - 16}" width="${ancho + 28}" height="16" fill="none" stroke="${AZUL}" stroke-width="3"/>`
  const paso = ancho / e.vanos
  for (let p = 0; p < e.pisos; p++) {
    const y = oy - (p + 1) * altoPiso + altoPiso * 0.18
    s += `<line x1="${ox}" y1="${oy - p * altoPiso}" x2="${ox + ancho}" y2="${oy - p * altoPiso}" stroke="${AZUL}" stroke-width="1.5" opacity="0.4"/>`
    for (let v = 0; v < e.vanos; v++) {
      const x = ox + v * paso + paso * 0.28
      const w = paso * 0.44
      const color = x + w / 2 > mitad ? ROJO : AZUL
      const esPuerta = p === 0
      const h = altoPiso * (esPuerta ? 0.82 : 0.62)
      s += ventana(x, y, w, h, color, esPuerta && e.arcos)
      if (e.balcones && p > 0 && p % 2 === 1) s += baranda(x, y + h * 0.55, w, h * 0.42, color)
    }
  }
  s += `<rect x="${ox}" y="${top}" width="${ancho / 2}" height="${alto}" fill="none" stroke="${AZUL}" stroke-width="4"/>`
  s += `<rect x="${mitad}" y="${top}" width="${ancho / 2}" height="${alto}" fill="none" stroke="${ROJO}" stroke-width="4"/>`
  return s
}

function escena(id, e, tipo) {
  const suelo = 600
  let cuerpo = ''
  if (tipo === 'fachada') cuerpo = fachada(e, 330, suelo, 540)
  if (tipo === 'contexto') {
    cuerpo += `<rect x="40" y="${suelo - 300}" width="250" height="300" fill="#E3E6EA"/><rect x="910" y="${suelo - 380}" width="250" height="380" fill="#E3E6EA"/>`
    cuerpo += fachada(e, 360, suelo, 480)
    for (let i = 0; i < 6; i++) cuerpo += `<line x1="${60 + i * 190}" y1="${suelo + 40}" x2="${120 + i * 190}" y2="${suelo + 40}" stroke="#B9C0CA" stroke-width="6"/>`
  }
  if (tipo === 'detalle') cuerpo = `<g transform="translate(-700 -500) scale(2.2)">${fachada(e, 330, suelo, 540)}</g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ilustración de ${id}">
  <defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8EDF3"/><stop offset="1" stop-color="#F7F8FA"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#cielo)"/>
  <rect y="${suelo}" width="${W}" height="${H - suelo}" fill="#E1E4E8"/>
  ${cuerpo}
  <line x1="0" y1="${suelo}" x2="${W}" y2="${suelo}" stroke="${AZUL}" stroke-width="3"/>
</svg>`
}

mkdirSync(OUT, { recursive: true })
for (const [id, e] of Object.entries(EDIFICIOS)) {
  for (const tipo of ['fachada', 'contexto', 'detalle']) {
    writeFileSync(`${OUT}/${id}-${tipo}.svg`, escena(id, e, tipo))
  }
}
console.log('Ilustraciones generadas en', OUT)
