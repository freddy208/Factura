import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Building, Calendar, Shield, Edit, Camera } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

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

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  if (!profile) redirect('/onboarding')

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {(profile.company_name || profile.full_name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
              <p className="text-slate-500 text-sm">Gérez vos informations personnelles</p>
            </div>
          </div>
          <Link
            href="/settings"
            className="tap-target flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-all"
          >
            <Edit size={16} />
            <span className="hidden sm:inline">Modifier</span>
          </Link>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            profile.plan === 'pro' 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            <Shield size={14} />
            <span>Plan {profile.plan === 'pro' ? 'Pro' : 'Gratuit'}</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            <Calendar size={14} />
            <span>Membre depuis {formatDate(profile.created_at)}</span>
          </div>
        </div>
      </section>

      {/* Informations principales */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <User size={20} className="text-blue-600" />
          Informations personnelles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block">
                Nom complet
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900">
                {profile.full_name || 'Non renseigné'}
              </div>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block">
                Email
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900">
                {profile.email}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block">
                Entreprise
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900">
                {profile.company_name || 'Non renseignée'}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block">
                Date d'activation Pro
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900">
                {profile.pro_activated_at ? formatDate(profile.pro_activated_at) : 'Non activé'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Building size={20} className="text-blue-600" />
          Activité du compte
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium mb-2">Factures créées</p>
            <p className="text-2xl font-bold text-blue-900">--</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <p className="text-xs text-green-600 font-medium mb-2">Devis créés</p>
            <p className="text-2xl font-bold text-green-900">--</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
            <p className="text-xs text-purple-600 font-medium mb-2">Clients</p>
            <p className="text-2xl font-bold text-purple-900">--</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <p className="text-xs text-amber-600 font-medium mb-2">Total encaissé</p>
            <p className="text-2xl font-bold text-amber-900">--</p>
          </div>
        </div>
      </section>

      {/* Actions rapides */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Actions rapides</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/factures/nouvelle"
            className="tap-target flex flex-col items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold">+</span>
            </div>
            <span className="text-sm font-medium text-slate-700">Nouvelle facture</span>
          </Link>

          <Link
            href="/devis/nouveau"
            className="tap-target flex flex-col items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 transition-all group"
          >
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold">+</span>
            </div>
            <span className="text-sm font-medium text-slate-700">Nouveau devis</span>
          </Link>

          <Link
            href="/clients/nouveau"
            className="tap-target flex flex-col items-center gap-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold">+</span>
            </div>
            <span className="text-sm font-medium text-slate-700">Nouveau client</span>
          </Link>

          <Link
            href="/settings"
            className="tap-target flex flex-col items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 transition-all group"
          >
            <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Edit size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Paramètres</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
