import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

// Shared icon design: monogram "D" on dark background with gold accent
function IconSvg({ size, maskable = false }: { size: number; maskable?: boolean }) {
  const padding = maskable ? size * 0.15 : 0
  const innerSize = size - padding * 2
  const fontSize = Math.round(innerSize * 0.56)
  const borderRadius = maskable ? size * 0.22 : size * 0.18

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0c0c0e',
        borderRadius: 0,
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
          border: '2px solid #2a2a32',
        }}
      >
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: fontSize,
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
  )
}

export async function GET() {
  return new ImageResponse(<IconSvg size={192} />, {
    width: 192,
    height: 192,
  })
}
