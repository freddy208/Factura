import { createClient } from '@/lib/supabase/server'
import { notificationActionsRateLimit } from '@/lib/rate-limiter'
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
    const { filter } = body

    // Validation du filtre
    const allowedFilters = ['all', 'unread', 'success', 'warning', 'error']
    if (!allowedFilters.includes(filter)) {
      return NextResponse.json({ error: 'Filtre invalide' }, { status: 400 })
    }

    // Pour la démo, on retourne les notifications simulées selon le filtre
    // En production, vous feriez une requête SQL avec WHERE clause
    const notifications = getSimulatedNotifications(filter)

    return NextResponse.json({ notifications })

  } catch (error) {
    console.error('Error filtering notifications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Simulation de données pour la démo
function getSimulatedNotifications(filter: string) {
  const allNotifications = [
    {
      id: '1',
      type: 'success',
      title: 'Facture payée !',
      message: 'La facture FACT-0015 a été payée par Client Tech Solutions',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      action_url: '/factures/FACT-0015'
    },
    {
      id: '2',
      type: 'info',
      title: 'Nouveau devis créé',
      message: 'Le devis DEV-0008 a été créé et envoyé à Client Alpha',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      action_url: '/devis/DEV-0008'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Facture en retard',
      message: 'La facture FACT-0012 est en retard de paiement depuis 5 jours',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      action_url: '/factures/FACT-0012'
    },
    {
      id: '4',
      type: 'info',
      title: 'Mise à jour Pro',
      message: 'Votre compte a été mis à niveau Pro avec succès',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      action_url: '/settings'
    },
    {
      id: '5',
      type: 'error',
      title: 'Erreur de paiement',
      message: 'Le paiement pour la facture FACT-0010 a échoué',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      action_url: '/factures/FACT-0010'
    }
  ]

  switch (filter) {
    case 'unread':
      return allNotifications.filter(n => !n.read)
    case 'success':
      return allNotifications.filter(n => n.type === 'success')
    case 'warning':
      return allNotifications.filter(n => n.type === 'warning')
    case 'error':
      return allNotifications.filter(n => n.type === 'error')
    default:
      return allNotifications
  }
}
