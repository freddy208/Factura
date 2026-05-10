// app/auth/reset-password/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Supabase renvoie parfois l'erreur directement dans l'URL
  if (error || errorDescription) {
    return NextResponse.redirect(`${origin}/reset-password?error=invalid_token`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/reset-password?error=missing_code`)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[reset-password callback] exchangeCodeForSession error:', exchangeError.message)
    return NextResponse.redirect(`${origin}/reset-password?error=invalid_token`)
  }

  // Session établie — rediriger vers la page de saisie du nouveau mot de passe
  return NextResponse.redirect(`${origin}/reset-password`)
}