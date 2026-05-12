import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { PLAN_LIMITS, checkUserLimits, calculateMonthlyStats, PlanType } from '@/lib/limits'
import { AdminUsersPageClient } from '@/components/admin/AdminUsersPageClient'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  const adminClient = createAdminClient()

  // Récupération des données
  let profiles: any[] | null = null
  let invoices: any[] | null = null
  let clients: any[] | null = null
  let pendingRequests: any[] | null = null
  
  try {
    const [
      profilesPromise,
      invoicesPromise,
      clientsPromise,
      pendingRequestsPromise
    ] = [
      adminClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }),
      
      adminClient
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000),
      
      adminClient
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000),
      
      adminClient
        .from('payment_requests')
        .select('*, profiles(email, company_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    ]

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 8000)
    )

    const [
      profilesResult,
      invoicesResult,
      clientsResult,
      pendingRequestsResult
    ] = await Promise.all([
      Promise.race([profilesPromise, timeoutPromise]),
      Promise.race([invoicesPromise, timeoutPromise]),
      Promise.race([clientsPromise, timeoutPromise]),
      Promise.race([pendingRequestsPromise, timeoutPromise])
    ])

    profiles = (profilesResult as any)?.data || []
    invoices = (invoicesResult as any)?.data || []
    clients = (clientsResult as any)?.data || []
    pendingRequests = (pendingRequestsResult as any)?.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des données utilisateurs:', error)
    profiles = []
    invoices = []
    clients = []
    pendingRequests = []
  }

  // Calcul des statistiques mensuelles avec la fonction centralisée
  function calculateUserStats(userId: string) {
    const monthlyStats = calculateMonthlyStats(invoices || [], userId)
    const userClients = clients?.filter((client: any) => client.user_id === userId) || []
    const currentMonth = new Date()
    const userInvoices = invoices?.filter((inv: any) => 
      inv.user_id === userId && 
      new Date(inv.created_at).getMonth() === currentMonth.getMonth() &&
      new Date(inv.created_at).getFullYear() === currentMonth.getFullYear()
    ) || []
    
    return {
      totalInvoices: monthlyStats.invoices,
      totalQuotes: monthlyStats.quotes,
      paidInvoices: monthlyStats.paidInvoices,
      totalRevenue: monthlyStats.revenue,
      totalClients: userClients.length,
      lastActivity: userInvoices.length > 0 ? 
        new Date(Math.max(...userInvoices.map((inv: any) => new Date(inv.created_at).getTime()))) : 
        null
    }
  }

  const totalUsers = profiles?.length || 0
  const proUsers = profiles?.filter((p: any) => p.plan === 'pro').length || 0
  const freeUsers = totalUsers - proUsers
  const pendingCount = pendingRequests?.length || 0

  // Utilisation des limites centralisées
  const FREE_INVOICE_LIMIT = PLAN_LIMITS.free.invoices_per_month
  const FREE_QUOTE_LIMIT = PLAN_LIMITS.free.quotes_per_month

  // Statistiques globales
  const globalStats = {
    totalInvoices: invoices?.filter((inv: any) => inv.type === 'invoice').length || 0,
    totalQuotes: invoices?.filter((inv: any) => inv.type === 'quote').length || 0,
    totalRevenue: invoices?.filter((inv: any) => inv.type === 'invoice' && inv.status === 'paid')
      .reduce((sum: number, inv: any) => sum + inv.total, 0) || 0,
    totalClients: clients?.length || 0,
    activeUsers: profiles?.filter((p: any) => {
      const stats = calculateUserStats(p.id)
      return stats.lastActivity && (Date.now() - stats.lastActivity.getTime()) < 30 * 24 * 60 * 60 * 1000
    }).length || 0
  }

  return (
    <AdminUsersPageClient
      profiles={profiles || []}
      invoices={invoices || []}
      clients={clients || []}
      totalUsers={totalUsers}
      proUsers={proUsers}
      freeUsers={freeUsers}
      pendingCount={pendingCount}
      globalStats={globalStats}
    />
  )
}
