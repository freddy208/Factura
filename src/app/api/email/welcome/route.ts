import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/resend'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    await sendWelcomeEmail(email, name || 'là')
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur email' }, { status: 500 })
  }
}