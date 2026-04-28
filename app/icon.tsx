import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0c0e',
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 20,
            fontWeight: 700,
            color: '#d4a853',
            lineHeight: 1,
          }}
        >
          D
        </span>
      </div>
    ),
    { ...size }
  )
}
