import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Eye,
  BarChart3
} from 'lucide-react'

export default async function AdminInvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  const adminClient = createAdminClient()

  // Récupération des données
  let invoices: any[] | null = null
  let profiles: any[] | null = null
  let clients: any[] | null = null
  
  try {
    const [
      invoicesPromise,
      profilesPromise,
      clientsPromise
    ] = [
      adminClient
        .from('invoices')
        .select(`
          *,
          profiles!inner(
            email,
            company_name,
            plan
          ),
          clients!inner(
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(500),
      
      adminClient
        .from('profiles')
        .select('id, email, company_name, plan')
        .order('created_at', { ascending: false }),
      
      adminClient
        .from('clients')
        .select('id, name, email, user_id')
        .order('created_at', { ascending: false })
        .limit(1000)
    ]

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    )

    const [
      invoicesResult,
      profilesResult,
      clientsResult
    ] = await Promise.all([
      Promise.race([invoicesPromise, timeoutPromise]),
      Promise.race([profilesPromise, timeoutPromise]),
      Promise.race([clientsPromise, timeoutPromise])
    ])

    invoices = (invoicesResult as any)?.data || []
    profiles = (profilesResult as any)?.data || []
    clients = (clientsResult as any)?.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des factures:', error)
    invoices = []
    profiles = []
    clients = []
  }

  // Calcul des statistiques
  const totalInvoices = invoices?.filter((inv: any) => inv.type === 'invoice').length || 0
  const totalQuotes = invoices?.filter((inv: any) => inv.type === 'quote').length || 0
  const paidInvoices = invoices?.filter((inv: any) => inv.type === 'invoice' && inv.status === 'paid').length || 0
  const pendingInvoices = invoices?.filter((inv: any) => inv.type === 'invoice' && inv.status === 'pending').length || 0
  const overdueInvoices = invoices?.filter((inv: any) => inv.type === 'invoice' && inv.status === 'overdue').length || 0
  
  const totalRevenue = invoices?.filter((inv: any) => inv.type === 'invoice' && inv.status === 'paid')
    .reduce((sum: number, inv: any) => sum + inv.total, 0) || 0

  // Statistiques du mois en cours
  const currentMonth = new Date()
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  
  const thisMonthInvoices = invoices?.filter((inv: any) => 
    inv.type === 'invoice' && new Date(inv.created_at) >= monthStart
  ).length || 0

  const thisMonthRevenue = invoices?.filter((inv: any) => 
    inv.type === 'invoice' && inv.status === 'paid' && new Date(inv.created_at) >= monthStart
  ).reduce((sum: number, inv: any) => sum + inv.total, 0) || 0

  // Top utilisateurs par nombre de factures
  const topUsersByInvoices = profiles?.map((profile: any) => {
    const userInvoices = invoices?.filter((inv: any) => 
      inv.user_id === profile.id && inv.type === 'invoice'
    ).length || 0
    const userRevenue = invoices?.filter((inv: any) => 
      inv.user_id === profile.id && inv.type === 'invoice' && inv.status === 'paid'
    ).reduce((sum: number, inv: any) => sum + inv.total, 0) || 0
    
    return {
      ...profile,
      invoiceCount: userInvoices,
      revenue: userRevenue
    }
  }).sort((a, b) => b.invoiceCount - a.invoiceCount).slice(0, 10) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Factures</h1>
          <p className="text-slate-600 mt-1">Vue d'ensemble de toutes les factures et devis de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download size={16} className="text-slate-600" />
            <span className="text-sm font-medium">Exporter CSV</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Temps réel</span>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Total Factures</span>
            <FileText size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalInvoices}</div>
          <div className="text-xs text-slate-500 mt-1">{thisMonthInvoices} ce mois</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Revenus Totaux</span>
            <DollarSign size={16} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()}€</div>
          <div className="text-xs text-slate-500 mt-1">{thisMonthRevenue.toLocaleString()}€ ce mois</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Factures Payées</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{paidInvoices}</div>
          <div className="text-xs text-slate-500 mt-1">
            {totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(1) : 0}% de taux de paiement
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Total Devis</span>
            <FileText size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{totalQuotes}</div>
          <div className="text-xs text-slate-500 mt-1">
            {totalInvoices + totalQuotes > 0 ? ((totalQuotes / (totalInvoices + totalQuotes)) * 100).toFixed(1) : 0}% des documents
          </div>
        </div>
      </section>

      {/* Filtres et recherche */}
      <section className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une facture (numéro, client, entreprise...)"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les types</option>
              <option value="invoice">Factures</option>
              <option value="quote">Devis</option>
            </select>
            <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les statuts</option>
              <option value="paid">Payées</option>
              <option value="pending">En attente</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulées</option>
            </select>
            <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Filter size={16} />
              <span>Filtrer</span>
            </button>
          </div>
        </div>
      </section>

      {/* Liste des factures */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Liste des documents</h2>
            <span className="text-sm text-slate-500">{invoices?.length || 0} documents</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <caption className="sr-only">Liste des factures et devis avec leurs informations</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-slate-700">Document</th>
                <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-slate-700">Client</th>
                <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-slate-700">Utilisateur</th>
                <th scope="col" className="text-center py-3 px-4 text-sm font-medium text-slate-700">Montant</th>
                <th scope="col" className="text-center py-3 px-4 text-sm font-medium text-slate-700">Statut</th>
                <th scope="col" className="text-center py-3 px-4 text-sm font-medium text-slate-700">Date</th>
                <th scope="col" className="text-center py-3 px-4 text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices?.map((invoice: any, index: number) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        invoice.type === 'invoice' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        <FileText size={16} className={
                          invoice.type === 'invoice' ? 'text-blue-600' : 'text-purple-600'
                        } />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {invoice.type === 'invoice' ? 'Facture' : 'Devis'} #{invoice.number || `INV-${invoice.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-slate-500">{invoice.type === 'invoice' ? 'Facture' : 'Devis'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {(invoice.clients as any)?.name || 'Client inconnu'}
                      </p>
                      <p className="text-xs text-slate-500">{(invoice.clients as any)?.email || ''}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-slate-600 font-bold text-xs">
                          {((invoice.profiles as any)?.company_name || (invoice.profiles as any)?.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {(invoice.profiles as any)?.company_name || 'Sans entreprise'}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            (invoice.profiles as any)?.plan === 'pro' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {(invoice.profiles as any)?.plan === 'pro' ? 'Pro' : 'Free'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-bold text-slate-900">{invoice.total?.toLocaleString() || 0}€</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                      invoice.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      invoice.status === 'cancelled' ? 'bg-slate-100 text-slate-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {invoice.status === 'paid' ? 'Payée' :
                       invoice.status === 'pending' ? 'En attente' :
                       invoice.status === 'overdue' ? 'En retard' :
                       invoice.status === 'cancelled' ? 'Annulée' :
                       invoice.status}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">{formatDate(invoice.created_at)}</p>
                      <p className="text-xs text-slate-500">{formatDate(invoice.due_date)}</p>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center gap-2 justify-center">
                      <button 
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Voir les détails de la facture"
                        role="button"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Télécharger la facture"
                        role="button"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top utilisateurs */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Top utilisateurs par factures</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Voir tout →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topUsersByInvoices.map((user, index) => (
            <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 text-sm">
                  {user.company_name || 'Sans entreprise'}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{user.invoiceCount}</div>
                <div className="text-xs text-green-600">{user.revenue.toLocaleString()}€</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
