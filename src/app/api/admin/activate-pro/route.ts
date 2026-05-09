import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendProActivationEmail } from '@/lib/email/resend'
import { strictRateLimitAsync } from '@/lib/rate-limiter'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function POST(req: NextRequest) {
  const rateLimitResponse = await strictRateLimitAsync(req)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await req.json()
    const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
    const requestId =
      body.requestId === null || body.requestId === undefined
        ? null
        : typeof body.requestId === 'string'
          ? body.requestId.trim()
          : ''

    if (!userId) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email || !ADMIN_EMAIL || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY manquante')
      return NextResponse.json({ error: 'Configuration serveur' }, { status: 500 })
    }

    const adminClient = createAdminClient()

    const { data: profileRow, error: profileFetchError } = await adminClient
      .from('profiles')
      .select('id, email, company_name, plan')
      .eq('id', userId)
      .maybeSingle()

    type TargetProfile = {
      id: string
      email: string
      company_name: string | null
      plan: string
    }

    const targetProfile = profileRow as TargetProfile | null

    if (profileFetchError || !targetProfile) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const { error: updateProfileError } = await (adminClient.from('profiles') as any)
      .update({
        plan: 'pro',
        pro_activated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateProfileError) {
      console.error('activate-pro profile update:', updateProfileError)
      return NextResponse.json({ error: 'Mise à jour du profil impossible' }, { status: 500 })
    }

    if (requestId) {
      const { data: payReq } = await adminClient
        .from('payment_requests')
        .select('user_id')
        .eq('id', requestId)
        .maybeSingle()

      const pr = payReq as { user_id: string } | null
      if (pr && pr.user_id !== userId) {
        return NextResponse.json({ error: 'Demande de paiement invalide' }, { status: 400 })
      }

      const { error: reqUpdateError } = await (adminClient.from('payment_requests') as any)
        .update({
          status: 'validated',
          validated_by: 'admin',
          validated_at: new Date().toISOString(),
        })
        .eq('id', requestId)

      if (reqUpdateError) {
        console.error('activate-pro payment_requests update:', reqUpdateError)
      }
    }

    if (process.env.RESEND_API_KEY && targetProfile.email) {
      try {
        await sendProActivationEmail(
          targetProfile.email,
          targetProfile.company_name?.trim() || 'Votre entreprise'
        )
      } catch (emailErr) {
        console.error('activate-pro email:', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/admin/activate-pro:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
