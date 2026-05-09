import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

async function handler(request: NextRequest) {
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

  if (isPublicRoute) {
    return NextResponse.next()
  }

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

  if (!isAuthRoute && !isProtectedRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (isProtectedRoute || isAdminRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  const response = NextResponse.next({ request })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }: any) => {
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
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const proxy = handler

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest|icon|sw.js|workbox|api).*)',
  ],
}
