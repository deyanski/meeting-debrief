import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Guard against open redirect — only allow same-origin paths
  const safeNext = next.startsWith('/') ? next : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Use x-forwarded-host on Vercel; fall back to request origin
      const forwardedHost = request.headers.get('x-forwarded-host')
      const origin =
        process.env.NODE_ENV !== 'development' && forwardedHost
          ? `https://${forwardedHost}`
          : request.nextUrl.origin

      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  return NextResponse.redirect(
    `${request.nextUrl.origin}/auth/auth-code-error`
  )
}
