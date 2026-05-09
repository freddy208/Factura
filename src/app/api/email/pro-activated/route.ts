import { NextRequest, NextResponse } from 'next/server'
import { sendProActivationEmail } from '@/lib/email/resend'

export async function POST(req: NextRequest) {
  try {
    const { email, companyName } = await req.json()
    await sendProActivationEmail(email, companyName)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur email' }, { status: 500 })
  }
}