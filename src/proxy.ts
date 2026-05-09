import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const path = request.nextUrl.pathname

  // Routes publiques — jamais interceptées
  const isPublicRoute =
    path === '/' ||
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.startsWith('/manifest') ||
    path.startsWith('/icon') ||
    path.startsWith('/offline') ||
    path.startsWith('/sw.js') ||
    path.startsWith('/workbox')

  if (isPublicRoute) return response

  const isAuthRoute = path === '/login' || path === '/register'
  const isProtectedRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/clients') ||
    path.startsWith('/factures') ||
    path.startsWith('/devis') ||
    path.startsWith('/upgrade') ||
    path.startsWith('/onboarding') ||
    path.startsWith('/profil') ||
    path.startsWith('/settings') ||
    path.startsWith('/notifications')
  const isAdminRoute = path.startsWith('/admin')

  // Vérifier session uniquement si nécessaire
  if (!isAuthRoute && !isProtectedRoute && !isAdminRoute) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  await supabase.auth.getSession()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isAdminRoute && (!user || user.email !== process.env.ADMIN_EMAIL)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-|sw.js|workbox-).*)',
  ],
}