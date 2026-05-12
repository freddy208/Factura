import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { PLAN_LIMITS, checkUserLimits, calculateMonthlyStats, PlanType } from '@/lib/limits'
import { tokens } from '@/lib/design-system'
import { AdminActivateButton } from '@/components/admin/AdminActivateButton'
import { UsersListClient } from '@/components/admin/UsersListClient'
import { Users, CheckCircle, Clock, Search, Filter, Download } from 'lucide-react'

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" role="banner">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{color: tokens.colors.gray[900]}}>Gestion des Utilisateurs</h1>
          <p className="text-sm sm:text-base mt-1" style={{color: tokens.colors.gray[600]}}>Administration complète des comptes FACTURA</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: tokens.colors.gray[50],
              border: `1px solid ${tokens.colors.gray[200]}`,
              color: tokens.colors.gray[700]
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.gray[100]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.gray[50]
            }}
            aria-label="Exporter la liste des utilisateurs"
            role="button"
            tabIndex={0}
          >
            <Download size={14} className="sm:size-16" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-medium">Exporter</span>
          </button>
          <div className="flex items-center gap-2 text-xs" style={{color: tokens.colors.gray[500]}} role="status" aria-live="polite">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: tokens.colors.success[500]}} aria-hidden="true"></div>
            <span>Temps réel</span>
          </div>
        </div>
      </header>

      {/* Statistiques globales */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" role="region" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Statistiques globales des utilisateurs</h2>
        <article className="rounded-xl border p-3 sm:p-4" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm" style={{color: tokens.colors.gray[600]}}>Total Utilisateurs</span>
            <Users size={14} className="sm:size-16" style={{color: tokens.colors.primary[600]}} aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.gray[900]}}>{totalUsers}</div>
          <div className="text-xs mt-1" style={{color: tokens.colors.gray[500]}}>{globalStats.activeUsers} actifs (30j)</div>
        </article>

        <article className="rounded-xl border p-3 sm:p-4" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm" style={{color: tokens.colors.gray[600]}}>Plans Pro</span>
            <CheckCircle size={14} className="sm:size-16" style={{color: tokens.colors.success[600]}} aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.success[600]}}>{proUsers}</div>
          <div className="text-xs mt-1" style={{color: tokens.colors.gray[500]}}>{((proUsers / totalUsers) * 100).toFixed(1)}% des utilisateurs</div>
        </article>

        <article className="rounded-xl border p-3 sm:p-4" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm" style={{color: tokens.colors.gray[600]}}>Plans Free</span>
            <Users size={14} className="sm:size-16" style={{color: tokens.colors.gray[600]}} aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.gray[900]}}>{freeUsers}</div>
          <div className="text-xs mt-1" style={{color: tokens.colors.gray[500]}}>{((freeUsers / totalUsers) * 100).toFixed(1)}% des utilisateurs</div>
        </article>

        <article className="rounded-xl border p-3 sm:p-4" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm" style={{color: tokens.colors.gray[600]}}>En attente</span>
            <Clock size={14} className="sm:size-16" style={{color: tokens.colors.warning[600]}} aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.warning[600]}}>{pendingCount}</div>
          <div className="text-xs mt-1" style={{color: tokens.colors.gray[500]}}>Validations requises</div>
        </article>
      </section>

      {/* Filtres et recherche */}
      <section className="rounded-xl border p-3 sm:p-4" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="search" aria-label="Filtres de recherche des utilisateurs">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="sm:size-20 absolute left-3 top-1/2 transform -translate-y-1/2" style={{color: tokens.colors.gray[400]}} aria-hidden="true" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 rounded-lg transition-all text-sm"
              style={{
                border: `2px solid ${tokens.colors.gray[200]}`,
                color: tokens.colors.gray[900]
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.primary[500]
                e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.colors.primary[100]}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.gray[200]
                e.currentTarget.style.boxShadow = 'none'
              }}
              aria-label="Rechercher un utilisateur par nom ou email"
              role="searchbox"
              tabIndex={0}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              className="px-3 sm:px-4 py-2 rounded-lg transition-all text-sm"
              style={{
                border: `2px solid ${tokens.colors.gray[200]}`,
                color: tokens.colors.gray[900]
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.primary[500]
                e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.colors.primary[100]}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.gray[200]
                e.currentTarget.style.boxShadow = 'none'
              }}
              aria-label="Filtrer par type de plan"
              tabIndex={0}
            >
              <option value="">Tous les plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
            <select 
              className="px-3 sm:px-4 py-2 rounded-lg transition-all text-sm"
              style={{
                border: `2px solid ${tokens.colors.gray[200]}`,
                color: tokens.colors.gray[900]
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.primary[500]
                e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.colors.primary[100]}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.gray[200]
                e.currentTarget.style.boxShadow = 'none'
              }}
              aria-label="Filtrer par statut d'activité"
              tabIndex={0}
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            <button 
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm"
              style={{
                backgroundColor: tokens.colors.primary[600],
                color: tokens.colors.gray[50]
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.primary[700]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.primary[600]
              }}
              aria-label="Appliquer les filtres"
              role="button"
              tabIndex={0}
            >
              <Filter size={14} className="sm:size-16" aria-hidden="true" />
              <span className="hidden sm:inline">Filtrer</span>
              <span className="sm:hidden">OK</span>
            </button>
          </div>
        </div>
      </section>

      {/* Liste des utilisateurs */}
      <section className="rounded-xl border overflow-hidden" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="region" aria-labelledby="users-list-heading">
        <header className="px-4 sm:px-6 py-3 sm:py-4 border-b" style={{backgroundColor: tokens.colors.gray[100], borderColor: tokens.colors.gray[200]}}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 id="users-list-heading" className="font-semibold" style={{color: tokens.colors.gray[900]}}>Liste des utilisateurs</h2>
            <span className="text-xs sm:text-sm" style={{color: tokens.colors.gray[500]}}>{profiles?.length || 0} utilisateurs</span>
          </div>
        </header>

        <div className="divide-y" style={{borderColor: tokens.colors.gray[200]}}>
          <UsersListClient 
            profiles={profiles || []}
            invoices={invoices || []}
            clients={clients || []}
          />
        </div>
      </section>
    </div>
  )
}
