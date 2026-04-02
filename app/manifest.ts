import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FuelMap PT — Preços de Combustíveis',
    short_name: 'FuelMap PT',
    description: 'Encontra os postos de combustível mais baratos em Portugal. Preços atualizados diariamente.',
    start_url: '/',
    display: 'standalone',
    background_color: '#eef2f7',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
