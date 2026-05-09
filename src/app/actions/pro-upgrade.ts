'use server'

import { createClient } from '@/lib/supabase/server'
import { sendPaymentNotifToAdmin } from '@/lib/email/resend'
import { paymentNotifyUserRateLimit } from '@/lib/rate-limiter'
import { PRO_MONTHLY_FCFA } from '@/lib/constants'

export async function notifyProPaymentInterestAction(): Promise<
  | { ok: true; mailed: boolean }
  | { ok: false; error: string }
> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    return { ok: false, error: 'Service temporairement indisponible.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'Connexion requise.' }
  }

  const rateOk = await paymentNotifyUserRateLimit(user.id)
  if (!rateOk) {
    return {
      ok: false,
      error: 'Vous avez déjà envoyé plusieurs demandes récemment.',
    }
  }

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('plan, company_name, email')
    .eq('id', user.id)
    .single()

  type ProfileRow = {
    plan: 'free' | 'pro'
    company_name: string | null
    email: string
  }

  const profile = profileRow as ProfileRow | null

  if (profileError || !profile) {
    return { ok: false, error: 'Profil introuvable.' }
  }

  if (profile.plan === 'pro') {
    return { ok: false, error: 'Vous êtes déjà Pro.' }
  }

  const { error: insertError } = await (supabase.from('payment_requests') as any).insert({
    user_id: user.id,
    amount: PRO_MONTHLY_FCFA,
    currency: 'XAF',
    status: 'pending',
  })

  if (insertError) {
    console.error('notifyProPaymentInterestAction insert:', insertError)
    return {
      ok: false,
      error:
        'Impossible d’enregistrer la demande. Vérifiez votre connexion ou utilisez WhatsApp.',
    }
  }

  try {
    await sendPaymentNotifToAdmin(
      profile.email || user.email || '',
      profile.company_name?.trim() || '(sans entreprise)',
      adminEmail
    )
    return { ok: true, mailed: true }
  } catch (e) {
    console.error('notifyProPaymentInterestAction email:', e)
    return { ok: true, mailed: false }
  }
}
