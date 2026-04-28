import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0c0e',
        }}
      >
        <div
          style={{
            width: 156,
            height: 156,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#16161a',
            borderRadius: 32,
            border: '2px solid #2a2a32',
          }}
        >
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 86,
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
    { ...size }
  )
}
