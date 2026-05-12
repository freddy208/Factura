import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { PLAN_LIMITS, PLAN_PRICING } from '@/lib/limits'
import { CreditCard, Users, CheckCircle, AlertTriangle, Settings, TrendingUp, DollarSign, FileText, Crown, Zap } from 'lucide-react'

export default async function AdminPlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  const adminClient = createAdminClient()

  // Récupération des données
  let profiles: any[] | null = null
  let invoices: any[] | null = null
  let pendingRequests: any[] | null = null
  
  try {
    const [
      profilesPromise,
      invoicesPromise,
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
      pendingRequestsResult
    ] = await Promise.all([
      Promise.race([profilesPromise, timeoutPromise]),
      Promise.race([invoicesPromise, timeoutPromise]),
      Promise.race([pendingRequestsPromise, timeoutPromise])
    ])

    profiles = (profilesResult as any)?.data || []
    invoices = (invoicesResult as any)?.data || []
    pendingRequests = (pendingRequestsResult as any)?.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des données forfaits:', error)
    profiles = []
    invoices = []
    pendingRequests = []
  }

  // Calcul des statistiques
  const proUsers = profiles?.filter((p: any) => p.plan === 'pro') || []
  const freeUsers = profiles?.filter((p: any) => p.plan === 'free') || []
  
  // Utilisation des limites centralisées
  const FREE_INVOICE_LIMIT = PLAN_LIMITS.free.invoices_per_month
  const FREE_QUOTE_LIMIT = PLAN_LIMITS.free.quotes_per_month

  // Calcul des revenus potentiels
  const totalRevenue = invoices?.filter((inv: any) => inv.type === 'invoice' && inv.status === 'paid')
    .reduce((sum: number, inv: any) => sum + inv.total, 0) || 0

  // Plans configuration
  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Pour les freelances débutants',
      price: '0 FCFA',
      period: '/mois',
      icon: Users,
      color: 'slate',
      features: [
        `${FREE_INVOICE_LIMIT} factures/mois`,
        `${FREE_QUOTE_LIMIT} devis/mois`,
        '1 utilisateur',
        'Support email',
        'Export PDF',
        'Stockage cloud 1Go'
      ],
      limits: {
        invoices: PLAN_LIMITS.free.invoices_per_month,
        quotes: PLAN_LIMITS.free.quotes_per_month,
        clients: PLAN_LIMITS.free.clients_total,
        storage: `${PLAN_LIMITS.free.storage_gb}Go`
      },
      users: freeUsers.length,
      revenue: 0
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Pour les professionnels',
      price: `${PLAN_PRICING.pro.monthly_fcfa} FCFA`,
      period: '/mois',
      icon: Crown,
      color: 'blue',
      features: [
        'Factures illimitées',
        'Devis illimités',
        '3 utilisateurs',
        'Support prioritaire',
        'Export multi-formats',
        'Stockage cloud 50Go',
        'API avancée',
        'Tableau de bord analytics',
        'Intégrations tierces',
        'Sauvegarde automatique'
      ],
      limits: {
        invoices: '∞',
        quotes: '∞',
        clients: '∞',
        storage: `${PLAN_LIMITS.pro.storage_gb}Go`
      },
      users: proUsers.length,
      revenue: proUsers.length * PLAN_PRICING.pro.monthly_fcfa
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Forfaits</h1>
          <p className="text-slate-600 mt-1">Configuration et monitoring des plans d'abonnement</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Temps réel</span>
        </div>
      </div>

      {/* Statistiques globales */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-100">Revenus mensuels</span>
            <DollarSign size={20} className="text-blue-200" />
          </div>
          <div className="text-3xl font-bold">{(proUsers.length * PLAN_PRICING.pro.monthly_fcfa).toLocaleString()} FCFA</div>
          <div className="text-xs text-blue-100 mt-1">{proUsers.length} abonnés Pro</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Taux de conversion</span>
            <TrendingUp size={16} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {profiles?.length ? ((proUsers.length / profiles.length) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Free → Pro</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Utilisateurs Free</span>
            <Users size={16} className="text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{freeUsers.length}</div>
          <div className="text-xs text-slate-500 mt-1">Utilisateurs actifs</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Demandes en attente</span>
            <CreditCard size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{pendingRequests?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Validations requises</div>
        </div>
      </section>

      {/* Plans disponibles */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Plans disponibles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isPopular = plan.id === 'pro'
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 ${
                  isPopular 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50' 
                    : 'border-slate-200 bg-white'
                } p-6 transition-all duration-200 hover:shadow-lg`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Le plus populaire
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isPopular ? 'bg-blue-600' : 'bg-slate-100'
                    }`}>
                      <Icon size={24} className={isPopular ? 'text-white' : 'text-slate-600'} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${isPopular ? 'text-blue-900' : 'text-slate-900'}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-sm ${isPopular ? 'text-blue-700' : 'text-slate-600'}`}>
                        {plan.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${isPopular ? 'text-blue-900' : 'text-slate-900'}`}>
                      {plan.price}
                    </div>
                    <div className={`text-sm ${isPopular ? 'text-blue-700' : 'text-slate-600'}`}>
                      {plan.period}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle size={16} className={isPopular ? 'text-blue-600' : 'text-green-600'} />
                      <span className={`text-sm ${isPopular ? 'text-blue-900' : 'text-slate-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Statistiques du plan */}
                <div className={`border-t pt-4 ${isPopular ? 'border-blue-200' : 'border-slate-200'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={`text-2xl font-bold ${isPopular ? 'text-blue-900' : 'text-slate-900'}`}>
                        {plan.users}
                      </div>
                      <div className={`text-xs ${isPopular ? 'text-blue-700' : 'text-slate-600'}`}>
                        Utilisateurs actifs
                      </div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${isPopular ? 'text-blue-900' : 'text-slate-900'}`}>
                        {plan.revenue.toLocaleString()} FCFA
                      </div>
                      <div className={`text-xs ${isPopular ? 'text-blue-700' : 'text-slate-600'}`}>
                        Revenus mensuels
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button 
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      isPopular 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    aria-label={`Configurer le plan ${plan.name}`}
                  >
                    <Settings size={16} className="inline mr-2" />
                    Configurer
                  </button>
                  <button 
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      isPopular 
                        ? 'border border-blue-600 text-blue-600 hover:bg-blue-50' 
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    aria-label={`Voir les analytics du plan ${plan.name}`}
                  >
                    <TrendingUp size={16} className="inline mr-2" />
                    Analytics
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Limites et quotas */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Limites et quotas par plan</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-slate-700">Ressource</th>
                <th scope="col" className="text-center py-3 px-4 text-sm font-medium text-slate-700">Free</th>
                <th scope="col" className="text-center py-3 px-4 text-sm font-medium text-slate-700">Pro</th>
                <th scope="col" className="text-center py-3 px-4 text-sm font-medium text-slate-700">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">Factures</span>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-sm font-bold text-slate-900">{FREE_INVOICE_LIMIT}/mois</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-sm font-bold text-blue-600">Illimitées</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Actif</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">Devis</span>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-sm font-bold text-slate-900">{FREE_QUOTE_LIMIT}/mois</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-sm font-bold text-blue-600">Illimités</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Actif</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">Clients</span>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-sm font-bold text-slate-900">10</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-sm font-bold text-blue-600">Illimités</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Actif</span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">Stockage</span>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-sm font-bold text-slate-900">1Go</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-sm font-bold text-blue-600">50Go</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Actif</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Demandes d'upgrade en attente */}
      {pendingRequests && pendingRequests.length > 0 && (
        <section className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-amber-600" />
              <h2 className="text-lg font-bold text-amber-900">Demandes d'upgrade en attente</h2>
            </div>
            <span className="text-sm text-amber-700">{pendingRequests.length} validation{pendingRequests.length > 1 ? 's' : ''} requise{pendingRequests.length > 1 ? 's' : ''}</span>
          </div>
          
          <div className="space-y-3">
            {pendingRequests.slice(0, 5).map((req: any) => (
              <div key={req.id} className="bg-white rounded-lg p-4 border border-amber-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 font-bold text-xs">
                        {(req.profiles as any)?.company_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {(req.profiles as any)?.company_name || 'Sans entreprise'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(req.profiles as any)?.email} • {formatDate(req.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      Free → Pro
                    </span>
                    <span className="text-sm font-bold text-amber-600">+15,000 FCFA/mois</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {pendingRequests.length > 5 && (
            <div className="mt-4 text-center">
              <button 
                className="text-sm text-amber-700 hover:text-amber-800 font-medium"
                aria-label={`Voir les ${pendingRequests.length} demandes d'upgrade en attente`}
              >
                Voir toutes les demandes →
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
