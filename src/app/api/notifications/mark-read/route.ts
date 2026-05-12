import { createClient } from '@/lib/supabase/server'
import { notificationActionsRateLimit } from '@/lib/rate-limiter'
import { validateNotificationId } from '@/lib/security/sanitize'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = await notificationActionsRateLimit(user.id)
    if (!rateLimitResult) {
      return NextResponse.json({ error: 'Trop de requêtes. Veuillez réessayer plus tard.' }, { status: 429 })
    }

    const body = await request.json()
    const { notificationId, read } = body

    // Validation des entrées
    const sanitizedId = validateNotificationId(notificationId)
    if (!sanitizedId || typeof read !== 'boolean') {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    // Pour la démo, on simule la mise à jour en base de données
    // En production, vous auriez une table notifications dans Supabase
    console.log(`Notification ${sanitizedId} marked as ${read ? 'read' : 'unread'} by user ${user.id}`)

    return NextResponse.json({ 
      success: true, 
      message: `Notification marquée comme ${read ? 'lue' : 'non lue'}` 
    })

  } catch (error) {
    console.error('Error marking notification:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
