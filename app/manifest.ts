import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Meeting Debrief',
    short_name: 'Debrief',
    description: 'Turn meeting transcripts into structured, actionable debriefs.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0c0c0e',
    theme_color: '#d4a853',
    icons: [
      {
        src: '/icons/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/512',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/512-maskable',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
