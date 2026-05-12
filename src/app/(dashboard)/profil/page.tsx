import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Building, Calendar, Shield, Edit, Camera } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/ui/avatar'

type Profile = {
  full_name: string | null
  company_name: string | null
  email: string
  plan: 'free' | 'pro'
  created_at: string
  pro_activated_at: string | null
}

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let profileData = null
  let invoices = null
  let quotes = null
  let clients = null
  let error = null

  try {
    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Erreur profil:', profileError)
      error = profileError
    } else {
      profileData = profile
    }

    // Si le profil existe, récupérer les statistiques
    if (profileData) {
      const results = await Promise.all([
        supabase
          .from('invoices')
          .select('id, total, status')
          .eq('user_id', user.id)
          .eq('type', 'invoice'),
        supabase
          .from('invoices')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'quote'),
        supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id),
      ])

      invoices = results[0].data
      quotes = results[1].data
      clients = results[2].data
    }
  } catch (err) {
    console.error('Erreur réseau:', err)
    error = err
  }

  const profile = profileData as Profile | null

  if (!profile && !error) redirect('/onboarding')

  // Types pour les données
  type InvoiceData = {
    id: string
    total: number | null
    status: string
  }

  type QuoteData = {
    id: string
  }

  type ClientData = {
    id: string
  }

  // Calculer les statistiques
  const invoiceList = invoices as InvoiceData[] | null
  const quoteList = quotes as QuoteData[] | null
  const clientList = clients as ClientData[] | null

  const invoiceCount = invoiceList?.length ?? 0
  const quoteCount = quoteList?.length ?? 0
  const clientCount = clientList?.length ?? 0
  const totalPaid = invoiceList?.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total ?? 0), 0) ?? 0

  // Afficher le skeleton pendant le chargement
  if (!profile && !error) {
    return <ProfilSkeleton />
  }

  // Afficher l'erreur si présente
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h2>
          <p className="text-red-600">Impossible de charger les données du profil. Veuillez réessayer plus tard.</p>
        </div>
      </div>
    )
  }

  // TypeScript: profile est garanti non-null ici car on a vérifié !profile && !error plus haut
  if (!profile) {
    return <ProfilSkeleton />
  }

  return (
    <div className="space-y-6" role="main" aria-label="Page de profil utilisateur">
      {/* Header */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6" role="banner">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar 
              src={null}
              alt="Avatar utilisateur"
              fallback={profile!.company_name || profile!.full_name || 'U'}
              size="lg"
              className="shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
              <p className="text-slate-500 text-sm">Gérez vos informations personnelles</p>
            </div>
          </div>
          <Link
            href="/settings"
            className="tap-target flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-all"
            aria-label="Modifier mon profil"
          >
            <Edit size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Modifier</span>
          </Link>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Informations d'abonnement">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            profile!.plan === 'pro' 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
              : 'bg-slate-100 text-slate-600'
          }`} role="status" aria-label={`Plan ${profile!.plan === 'pro' ? 'Pro' : 'Gratuit'}`}>
            <Shield size={14} aria-hidden="true" />
            <span>Plan {profile!.plan === 'pro' ? 'Pro' : 'Gratuit'}</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-medium" role="status" aria-label={`Membre depuis ${formatDate(profile!.created_at)}`}>
            <Calendar size={14} aria-hidden="true" />
            <span>Membre depuis {formatDate(profile!.created_at)}</span>
          </div>
        </div>
      </section>

      {/* Informations principales */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6" role="region" aria-labelledby="personal-info-title">
        <h2 id="personal-info-title" className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <User size={20} className="text-blue-600" aria-hidden="true" />
          Informations personnelles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block" htmlFor="full-name">
                Nom complet
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900" id="full-name" role="textbox" aria-readonly="true">
                {profile!.full_name || 'Non renseigné'}
              </div>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block" htmlFor="email">
                Email
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900" id="email" role="textbox" aria-readonly="true">
                {profile!.email}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block" htmlFor="company">
                Entreprise
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900" id="company" role="textbox" aria-readonly="true">
                {profile!.company_name || 'Non renseignée'}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block" htmlFor="pro-activation">
                Date d'activation Pro
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900" id="pro-activation" role="textbox" aria-readonly="true">
                {profile!.pro_activated_at ? formatDate(profile!.pro_activated_at) : 'Non activé'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6" role="region" aria-labelledby="activity-title">
        <h2 id="activity-title" className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Building size={20} className="text-blue-600" aria-hidden="true" />
          Activité du compte
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="group" aria-label="Statistiques d'activité">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100" role="status" aria-label={`${invoiceCount} factures créées`}>
            <p className="text-xs text-blue-600 font-medium mb-2">Factures créées</p>
            <p className="text-2xl font-bold text-blue-900">{invoiceCount}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100" role="status" aria-label={`${quoteCount} devis créés`}>
            <p className="text-xs text-green-600 font-medium mb-2">Devis créés</p>
            <p className="text-2xl font-bold text-green-900">{quoteCount}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100" role="status" aria-label={`${clientCount} clients`}>
            <p className="text-xs text-purple-600 font-medium mb-2">Clients</p>
            <p className="text-2xl font-bold text-purple-900">{clientCount}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100" role="status" aria-label={`Total encaissé ${formatCurrency(totalPaid)}`}>
            <p className="text-xs text-amber-600 font-medium mb-2">Total encaissé</p>
            <p className="text-2xl font-bold text-amber-900">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
      </section>

      {/* Actions rapides */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6" role="region" aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="text-lg font-bold text-slate-900 mb-6">Actions rapides</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="group" aria-label="Actions rapides">
          <Link
            href="/factures/nouvelle"
            className="tap-target flex flex-col items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 transition-all group"
            aria-label="Créer une nouvelle facture"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" aria-hidden="true">
              <span className="text-white font-bold">+</span>
            </div>
            <span className="text-sm font-medium text-slate-700">Nouvelle facture</span>
          </Link>

          <Link
            href="/devis/nouveau"
            className="tap-target flex flex-col items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 transition-all group"
            aria-label="Créer un nouveau devis"
          >
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" aria-hidden="true">
              <span className="text-white font-bold">+</span>
            </div>
            <span className="text-sm font-medium text-slate-700">Nouveau devis</span>
          </Link>

          <Link
            href="/clients/nouveau"
            className="tap-target flex flex-col items-center gap-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 transition-all group"
            aria-label="Ajouter un nouveau client"
          >
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" aria-hidden="true">
              <span className="text-white font-bold">+</span>
            </div>
            <span className="text-sm font-medium text-slate-700">Nouveau client</span>
          </Link>

          <Link
            href="/settings"
            className="tap-target flex flex-col items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 transition-all group"
            aria-label="Accéder aux paramètres"
          >
            <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" aria-hidden="true">
              <Edit size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Paramètres</span>
          </Link>
        </div>
      </section>
    </div>
  )
}

// Composant Skeleton pour le chargement
function ProfilSkeleton() {
  return (
    <div className="space-y-6" role="main" aria-label="Chargement du profil">
      {/* Header Skeleton */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </section>

      {/* Informations Skeleton */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques Skeleton */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </section>

      {/* Actions Skeleton */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </section>
    </div>
  )
}
