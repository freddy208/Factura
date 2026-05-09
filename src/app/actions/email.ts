'use server'

import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/resend'
import { welcomeEmailUserRateLimit } from '@/lib/rate-limiter'

export async function sendWelcomeEmailAction(email: string, name: string) {
  const trimmedEmail = email.trim()
  const trimmedName = name.trim()

  if (!trimmedEmail.includes('@') || trimmedName.length < 2) {
    return { ok: false as const, error: 'Données invalides.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email || user.email.toLowerCase() !== trimmedEmail.toLowerCase()) {
    return { ok: false as const, error: 'Non autorisé.' }
  }

  const allowed = await welcomeEmailUserRateLimit(user.id)
  if (!allowed) {
    return { ok: false as const, error: 'Trop de tentatives, réessayez plus tard.' }
  }

  try {
    await sendWelcomeEmail(trimmedEmail, trimmedName)
    return { ok: true as const }
  } catch (e) {
    console.error('sendWelcomeEmailAction:', e)
    const msg =
      e instanceof Error && e.message.includes('RESEND_API_KEY')
        ? 'Configuration email indisponible.'
        : e instanceof Error
          ? e.message
          : 'Erreur envoi email.'
    return { ok: false as const, error: msg }
  }
}
