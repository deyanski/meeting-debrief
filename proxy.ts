import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — this keeps auth tokens alive between requests
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  const isAuthRoute =
    pathname === '/sign-in' || pathname.startsWith('/auth/')

  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    // PWA public resources — must be accessible without auth
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/icons/') ||
    pathname === '/sw.js' ||
    pathname === '/offline' ||
    pathname === '/icon' ||
    pathname === '/apple-icon'

  const isProtectedRoute = !isAuthRoute && !isPublicAsset

  if (!session && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    // Guard against open redirect: only allow same-origin paths
    if (pathname.startsWith('/')) {
      url.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(url)
  }

  if (session && pathname === '/sign-in') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.searchParams.delete('next')
    return NextResponse.redirect(url)
  }

  return response
}

export const proxyConfig = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\.ico|manifest\.webmanifest|icons/|sw\.js|offline|icon|apple-icon|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
