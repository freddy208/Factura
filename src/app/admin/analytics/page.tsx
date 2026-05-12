import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { tokens } from '@/lib/design-system'
import { BarChart3, TrendingUp, TrendingDown, Users, FileText, DollarSign, Calendar, Download, Filter, Activity, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { AnalyticsExportButton } from '@/components/admin/analytics-export-button'
import { ViewAllUsersButton } from '@/components/admin/view-all-users-button'

// Fonction pour calculer les données mensuelles réelles avec optimisation
function calculateMonthlyData(invoices: any[], profiles: any[]) {
  const now = new Date()
  const monthlyData = []
  
  // Cache des calculs pour optimiser les performances
  const invoiceCache = new Map()
  const profileCache = new Map()
  
  // Pré-calculer les factures par mois pour éviter les filtrages répétés
  invoices.forEach(inv => {
    if (inv.type === 'invoice') {
      const monthKey = new Date(inv.created_at).toISOString().slice(0, 7) // YYYY-MM
      if (!invoiceCache.has(monthKey)) {
        invoiceCache.set(monthKey, { count: 0, revenue: 0, paidRevenue: 0 })
      }
      const monthData = invoiceCache.get(monthKey)
      monthData.count++
      if (inv.status === 'paid') {
        monthData.revenue += inv.total
        monthData.paidRevenue += inv.total
      }
    }
  })
  
  // Pré-calculer les utilisateurs actifs par mois
  profiles.forEach(profile => {
    const userInvoices = invoices.filter(inv => inv.user_id === profile.id)
    userInvoices.forEach(inv => {
      const monthKey = new Date(inv.created_at).toISOString().slice(0, 7)
      if (!profileCache.has(monthKey)) {
        profileCache.set(monthKey, new Set())
      }
      profileCache.get(monthKey).add(profile.id)
    })
  })
  
  // Générer les 6 derniers mois de données réelles
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = monthDate.toISOString().slice(0, 7)
    const monthName = monthDate.toLocaleDateString('fr-FR', { month: 'short' })
    
    const monthInvoices = invoiceCache.get(monthKey) || { count: 0, revenue: 0, paidRevenue: 0 }
    const activeUsersCount = profileCache.get(monthKey)?.size || 0
    
    monthlyData.push({
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      invoices: monthInvoices.count,
      revenue: monthInvoices.paidRevenue,
      users: activeUsersCount
    })
  }
  
  return monthlyData
}

// Fonction optimisée pour calculer les top utilisateurs avec cache
function calculateTopUsers(profiles: any[], invoices: any[]) {
  const userRevenueMap = new Map()
  const userInvoiceCountMap = new Map()
  
  // Calculer les revenus et nombres de factures par utilisateur en une seule passe
  invoices.forEach(inv => {
    if (inv.type === 'invoice' && inv.status === 'paid') {
      const currentRevenue = userRevenueMap.get(inv.user_id) || 0
      userRevenueMap.set(inv.user_id, currentRevenue + inv.total)
    }
    if (inv.type === 'invoice') {
      const currentCount = userInvoiceCountMap.get(inv.user_id) || 0
      userInvoiceCountMap.set(inv.user_id, currentCount + 1)
    }
  })
  
  // Mapper les profils avec leurs statistiques
  return profiles
    .map((profile: any) => ({
      ...profile,
      revenue: userRevenueMap.get(profile.id) || 0,
      invoiceCount: userInvoiceCountMap.get(profile.id) || 0
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  const adminClient = createAdminClient()

  // Récupération des données pour analytics
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
        .limit(2000),
      
      adminClient
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2000),
      
      adminClient
        .from('payment_requests')
        .select('*, profiles(email, company_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    ]

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
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
    console.error('Erreur lors du chargement des analytics:', error)
    profiles = []
    invoices = []
    clients = []
    pendingRequests = []
  }

  // Calcul des statistiques avancées
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Statistiques globales
  const totalUsers = profiles?.length || 0
  const totalInvoices = invoices?.filter((inv: any) => inv.type === 'invoice').length || 0
  const totalQuotes = invoices?.filter((inv: any) => inv.type === 'quote').length || 0
  const totalRevenue = invoices?.filter((inv: any) => inv.type === 'invoice' && inv.status === 'paid')
    .reduce((sum: number, inv: any) => sum + inv.total, 0) || 0
  const totalClients = clients?.length || 0

  // Statistiques du mois en cours
  const thisMonthInvoices = invoices?.filter((inv: any) => 
    inv.type === 'invoice' && new Date(inv.created_at) >= thisMonth
  ).length || 0

  const thisMonthQuotes = invoices?.filter((inv: any) => 
    inv.type === 'quote' && new Date(inv.created_at) >= thisMonth
  ).length || 0

  const thisMonthRevenue = invoices?.filter((inv: any) => 
    inv.type === 'invoice' && inv.status === 'paid' && new Date(inv.created_at) >= thisMonth
  ).reduce((sum: number, inv: any) => sum + inv.total, 0) || 0

  // Statistiques du mois précédent
  const lastMonthInvoices = invoices?.filter((inv: any) => 
    inv.type === 'invoice' && new Date(inv.created_at) >= lastMonth && new Date(inv.created_at) < thisMonth
  ).length || 0

  const lastMonthQuotes = invoices?.filter((inv: any) => 
    inv.type === 'quote' && new Date(inv.created_at) >= lastMonth && new Date(inv.created_at) < thisMonth
  ).length || 0

  const lastMonthRevenue = invoices?.filter((inv: any) => 
    inv.type === 'invoice' && inv.status === 'paid' && new Date(inv.created_at) >= lastMonth && new Date(inv.created_at) < thisMonth
  ).reduce((sum: number, inv: any) => sum + inv.total, 0) || 0

  // Calcul des variations
  const invoiceGrowth = lastMonthInvoices > 0 ? ((thisMonthInvoices - lastMonthInvoices) / lastMonthInvoices) * 100 : 0
  const quoteGrowth = lastMonthQuotes > 0 ? ((thisMonthQuotes - lastMonthQuotes) / lastMonthQuotes) * 100 : 0
  const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  // Répartition par plan
  const proUsers = profiles?.filter((p: any) => p.plan === 'pro').length || 0
  const freeUsers = totalUsers - proUsers

  // Activité des utilisateurs
  const activeUsers = profiles?.filter((p: any) => {
    const userInvoices = invoices?.filter((inv: any) => inv.user_id === p.id) || []
    const lastActivity = userInvoices.length > 0 ? 
      new Date(Math.max(...userInvoices.map((inv: any) => new Date(inv.created_at).getTime()))) : 
      null
    return lastActivity && (Date.now() - lastActivity.getTime()) < 30 * 24 * 60 * 60 * 1000
  }).length || 0

  // Top utilisateurs par revenus (optimisé avec cache)
  const topUsersByRevenue = calculateTopUsers(profiles || [], invoices || [])

  // Données pour graphiques (calculées réellement)
  const monthlyData = calculateMonthlyData(invoices || [], profiles || [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between" role="banner">
        <div>
          <h1 className="text-3xl font-bold text-slate-900" id="analytics-title">Analytics & Statistiques</h1>
          <p className="text-slate-600 mt-1" id="analytics-description">Métriques détaillées et tendances de la plateforme</p>
        </div>
        <div className="flex items-center gap-3" role="toolbar" aria-label="Actions d'export">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Sélectionner la période"
            aria-describedby="analytics-description"
          >
            <Calendar size={16} className="text-slate-600" aria-hidden="true" />
            <span className="text-sm font-medium">Derniers 30 jours</span>
          </button>
          <AnalyticsExportButton 
            data={{
              profiles,
              invoices,
              clients,
              topUsersByRevenue,
              monthlyData,
              totalUsers,
              totalRevenue,
              totalInvoices,
              totalQuotes,
              totalClients
            }}
          />
        </div>
      </header>

      {/* KPIs principaux */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-labelledby="analytics-title">
        <article className="bg-white rounded-xl border border-slate-200 p-6" role="article" aria-labelledby="kpi-users-title">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: tokens.colors.primary[50] }}>
              <Users size={24} style={{ color: tokens.colors.primary[600] }} aria-hidden="true" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              invoiceGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`} aria-label={`Variation ${Math.abs(invoiceGrowth).toFixed(1)}% ${invoiceGrowth >= 0 ? 'positive' : 'negative'}`}>
              {invoiceGrowth >= 0 ? <ArrowUpRight size={16} aria-hidden="true" /> : <ArrowDownRight size={16} aria-hidden="true" />}
              {Math.abs(invoiceGrowth).toFixed(1)}%
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1" id="kpi-users-title">{totalUsers}</div>
          <div className="text-sm text-slate-600">Utilisateurs totaux</div>
          <div className="text-xs text-slate-500 mt-2">{activeUsers} actifs (30j)</div>
        </article>

        <article className="bg-white rounded-xl border border-slate-200 p-6" role="article" aria-labelledby="kpi-revenue-title">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: tokens.colors.success[50] }}>
              <DollarSign size={24} style={{ color: tokens.colors.success[600] }} aria-hidden="true" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`} aria-label={`Variation ${Math.abs(revenueGrowth).toFixed(1)}% ${revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
              {revenueGrowth >= 0 ? <ArrowUpRight size={16} aria-hidden="true" /> : <ArrowDownRight size={16} aria-hidden="true" />}
              {Math.abs(revenueGrowth).toFixed(1)}%
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1" id="kpi-revenue-title">{totalRevenue.toLocaleString()} FCFA</div>
          <div className="text-sm text-slate-600">Revenus totaux</div>
          <div className="text-xs text-slate-500 mt-2">{thisMonthRevenue.toLocaleString()} FCFA ce mois</div>
        </article>

        <article className="bg-white rounded-xl border border-slate-200 p-6" role="article" aria-labelledby="kpi-invoices-title">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: tokens.colors.secondary[50] }}>
              <FileText size={24} style={{ color: tokens.colors.secondary[600] }} aria-hidden="true" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-blue-600" aria-label={`Croissance ${((thisMonthInvoices / Math.max(lastMonthInvoices, 1)) * 100).toFixed(1)}%`}>
              <ArrowUpRight size={16} aria-hidden="true" />
              {((thisMonthInvoices / Math.max(lastMonthInvoices, 1)) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1" id="kpi-invoices-title">{totalInvoices}</div>
          <div className="text-sm text-slate-600">Factures totales</div>
          <div className="text-xs text-slate-500 mt-2">{thisMonthInvoices} ce mois</div>
        </article>

        <article className="bg-white rounded-xl border border-slate-200 p-6" role="article" aria-labelledby="kpi-pro-title">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: tokens.colors.warning[50] }}>
              <TrendingUp size={24} style={{ color: tokens.colors.warning[600] }} aria-hidden="true" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600" aria-label={`Pourcentage utilisateurs Pro ${totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : 0}%`}>
              <ArrowUpRight size={16} aria-hidden="true" />
              {totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1" id="kpi-pro-title">{proUsers}</div>
          <div className="text-sm text-slate-600">Utilisateurs Pro</div>
          <div className="text-xs text-slate-500 mt-2">{freeUsers} Free</div>
        </article>
      </section>

      {/* Graphiques et tendances */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="region" aria-labelledby="charts-title">
        {/* Évolution mensuelle */}
        <div className="bg-white rounded-xl border border-slate-200 p-6" role="region" aria-labelledby="evolution-title">
          <h2 className="text-lg font-bold text-slate-900 mb-4" id="evolution-title">Évolution mensuelle</h2>
          <div className="space-y-4" role="list" aria-label="Statistiques mensuelles">
            {monthlyData.map((data: any, index: number) => (
              <div key={data.month} className="flex items-center gap-4" role="listitem">
                <div className="w-12 text-sm font-medium text-slate-600">{data.month}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xs text-slate-500 w-16">Factures</div>
                    <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ backgroundColor: tokens.colors.gray[100] }}>
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: tokens.colors.primary[600],
                          width: `${(data.invoices / Math.max(...monthlyData.map((d: any) => d.invoices))) * 100}%` 
                        }}
                        aria-label={`${data.invoices} factures en ${data.month}`}
                      />
                    </div>
                    <div className="text-xs font-medium text-slate-900 w-8 text-right">{data.invoices}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-500 w-16">Revenus</div>
                    <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ backgroundColor: tokens.colors.gray[100] }}>
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: tokens.colors.success[600],
                          width: `${(data.revenue / Math.max(...monthlyData.map((d: any) => d.revenue))) * 100}%` 
                        }}
                        aria-label={`${(data.revenue / 1000).toFixed(1)}k FCFA de revenus en ${data.month}`}
                      />
                    </div>
                    <div className="text-xs font-medium text-slate-900 w-16 text-right">{(data.revenue / 1000).toFixed(1)}k FCFA</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition des utilisateurs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6" role="region" aria-labelledby="repartition-title">
          <h2 className="text-lg font-bold text-slate-900 mb-4" id="repartition-title">Répartition des utilisateurs</h2>
          <div className="space-y-6">
            <div role="group" aria-labelledby="pro-users-label">
              <div className="flex items-center justify-between mb-2" id="pro-users-label">
                <span className="text-sm font-medium text-slate-700">Plans Pro</span>
                <span className="text-sm font-bold" style={{ color: tokens.colors.primary[600] }}>{proUsers} utilisateurs</span>
              </div>
              <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: tokens.colors.gray[100] }}>
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    background: `linear-gradient(to right, ${tokens.colors.primary[600]}, ${tokens.colors.secondary[600]})`,
                    width: `${totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0}%` 
                  }}
                  role="progressbar"
                  aria-valuenow={totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Pourcentage d'utilisateurs Pro: ${totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : 0}%`}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : 0}% des utilisateurs
              </div>
            </div>

            <div role="group" aria-labelledby="free-users-label">
              <div className="flex items-center justify-between mb-2" id="free-users-label">
                <span className="text-sm font-medium text-slate-700">Plans Free</span>
                <span className="text-sm font-bold" style={{ color: tokens.colors.gray[600] }}>{freeUsers} utilisateurs</span>
              </div>
              <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: tokens.colors.gray[100] }}>
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    background: `linear-gradient(to right, ${tokens.colors.gray[600]}, ${tokens.colors.gray[700]})`,
                    width: `${totalUsers > 0 ? (freeUsers / totalUsers) * 100 : 0}%` 
                  }}
                  role="progressbar"
                  aria-valuenow={totalUsers > 0 ? Math.round((freeUsers / totalUsers) * 100) : 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Pourcentage d'utilisateurs Free: ${totalUsers > 0 ? ((freeUsers / totalUsers) * 100).toFixed(1) : 0}%`}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {totalUsers > 0 ? ((freeUsers / totalUsers) * 100).toFixed(1) : 0}% des utilisateurs
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: tokens.colors.success[600] }}>{(proUsers * 15000).toLocaleString()} FCFA</div>
                  <div className="text-xs text-slate-500">Revenus mensuels</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: tokens.colors.primary[600] }}>{freeUsers}</div>
                  <div className="text-xs text-slate-500">Potentiel de conversion</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top utilisateurs */}
      <section className="bg-white rounded-xl border border-slate-200 p-6" role="region" aria-labelledby="top-users-title">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900" id="top-users-title">Top utilisateurs par revenus</h2>
          <ViewAllUsersButton />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Tableau des meilleurs utilisateurs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700" scope="col">Utilisateur</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-700" scope="col">Plan</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-700" scope="col">Factures</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-700" scope="col">Revenus</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-700" scope="col">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topUsersByRevenue.map((user: any, index: number) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: tokens.colors.primary[100] }}>
                        <span style={{ color: tokens.colors.primary[600] }} className="font-bold text-xs">
                          {(user.company_name || user.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {user.company_name || 'Sans entreprise'}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user.plan === 'pro' 
                        ? '' 
                        : ''
                    }`} style={{
                      backgroundColor: user.plan === 'pro' ? tokens.colors.primary[100] : tokens.colors.gray[100],
                      color: user.plan === 'pro' ? tokens.colors.primary[700] : tokens.colors.gray[700]
                    }}>
                      {user.plan === 'pro' ? 'Pro' : 'Free'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-sm font-medium text-slate-900">{user.invoiceCount}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-sm font-bold" style={{ color: tokens.colors.success[600] }}>{user.revenue.toLocaleString()} FCFA</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-xs px-2 py-1 rounded-full" style={{
                      backgroundColor: tokens.colors.success[100],
                      color: tokens.colors.success[700]
                    }}>
                      Actif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Métriques additionnelles */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" role="region" aria-labelledby="metrics-title">
        <article className="bg-white rounded-xl border border-slate-200 p-6" role="article" aria-labelledby="engagement-title">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: tokens.colors.secondary[50] }}>
              <Activity size={20} style={{ color: tokens.colors.secondary[600] }} aria-hidden="true" />
            </div>
            <h3 className="font-bold text-slate-900" id="engagement-title">Engagement</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Taux d'activité</span>
              <span className="text-sm font-bold text-slate-900">
                {totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Factures/utilisateur</span>
              <span className="text-sm font-bold text-slate-900">
                {totalUsers > 0 ? (totalInvoices / totalUsers).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Revenu moyen</span>
              <span className="text-sm font-bold text-slate-900">
                {proUsers > 0 ? (totalRevenue / proUsers).toFixed(0) : 0} FCFA
              </span>
            </div>
          </div>
        </article>

        <article className="bg-white rounded-xl border border-slate-200 p-6" role="article" aria-labelledby="performance-title">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: tokens.colors.success[50] }}>
              <Clock size={20} style={{ color: tokens.colors.success[600] }} aria-hidden="true" />
            </div>
            <h3 className="font-bold text-slate-900" id="performance-title">Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Temps de réponse</span>
              <span className="text-sm font-bold" style={{ color: tokens.colors.success[600] }}>&lt; 2h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Uptime système</span>
              <span className="text-sm font-bold" style={{ color: tokens.colors.success[600] }}>99.9%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Satisfaction</span>
              <span className="text-sm font-bold" style={{ color: tokens.colors.success[600] }}>4.8/5</span>
            </div>
          </div>
        </article>

        <article className="bg-white rounded-xl border border-slate-200 p-6" role="article" aria-labelledby="documents-title">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: tokens.colors.primary[50] }}>
              <FileText size={20} style={{ color: tokens.colors.primary[600] }} aria-hidden="true" />
            </div>
            <h3 className="font-bold text-slate-900" id="documents-title">Documents</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Total factures</span>
              <span className="text-sm font-bold text-slate-900">{totalInvoices}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Total devis</span>
              <span className="text-sm font-bold text-slate-900">{totalQuotes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Total clients</span>
              <span className="text-sm font-bold text-slate-900">{totalClients}</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
