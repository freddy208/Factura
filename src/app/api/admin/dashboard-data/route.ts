import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Vérifier que l'utilisateur est un admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Timeout très court pour éviter les problèmes
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 2000)
    )

    // Requêtes parallèles avec timeout
    const profilesPromise = adminClient
      .from('profiles')
      .select('id, email, company_name, plan, created_at, pro_activated_at')
      .order('created_at', { ascending: false })
      .limit(50) // Réduit à 50 pour être plus rapide

    const pendingRequestsPromise = adminClient
      .from('payment_requests')
      .select('id, user_id, created_at, profiles!inner(email, company_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5) // Réduit à 5 pour être plus rapide

    const [profilesResult, pendingRequestsResult] = await Promise.all([
      Promise.race([profilesPromise, timeoutPromise]),
      Promise.race([pendingRequestsPromise, timeoutPromise])
    ])

    const profiles = (profilesResult as any)?.data || []
    const pendingRequests = (pendingRequestsResult as any)?.data || []

    return NextResponse.json({
      profiles,
      pendingRequests,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Dashboard API Error:', error)
    
    // En cas d'erreur, retourner des données vides plutôt que de faire échouer la requête
    return NextResponse.json({
      profiles: [],
      pendingRequests: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}
