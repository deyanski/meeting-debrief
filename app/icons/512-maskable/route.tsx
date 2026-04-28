import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

// Maskable icon: content within the center 80% safe zone (10% padding each side)
export async function GET() {
  const size = 512
  const safePadding = size * 0.12 // ~12% padding = generous safe zone
  const innerSize = size - safePadding * 2
  const borderRadius = innerSize * 0.2

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0c0e',
        }}
      >
        <div
          style={{
            width: innerSize,
            height: innerSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#16161a',
            borderRadius: borderRadius,
            border: '3px solid #2a2a32',
          }}
        >
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: Math.round(innerSize * 0.54),
              fontWeight: 700,
              color: '#d4a853',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            D
          </span>
        </div>
      </div>
    ),
    { width: size, height: size }
  )
}
