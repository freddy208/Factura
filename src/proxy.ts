import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })
  const path = request.nextUrl.pathname

  const isPublicRoute =
    path === '/' ||
    path.startsWith('/api') ||
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

  if (!isAuthRoute && !isProtectedRoute && !isAdminRoute) return response

  // ← Vérification critique : si les vars manquent, laisse passer
  // La sécurité est garantie par le RLS Supabase et les Server Components
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('PROXY: Supabase env vars missing')
    // Si vars manquantes → redirige login pour les routes protégées
    if (isProtectedRoute || isAdminRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    })

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

  } catch (error) {
    console.error('PROXY error:', error)
    // En cas d'erreur → laisse passer, la sécurité est dans les pages
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clients/:path*',
    '/factures/:path*',
    '/devis/:path*',
    '/upgrade/:path*',
    '/onboarding/:path*',
    '/profil/:path*',
    '/settings/:path*',
    '/notifications/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}