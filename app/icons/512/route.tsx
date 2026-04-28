import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0c0e',
        }}
      >
        <div
          style={{
            width: 448,
            height: 448,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#16161a',
            borderRadius: 92,
            border: '3px solid #2a2a32',
          }}
        >
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 252,
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
    { width: 512, height: 512 }
  )
}
