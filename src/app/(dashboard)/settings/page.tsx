import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Building, Shield, Bell, Lock, Smartphone, Globe, Trash2, Save } from 'lucide-react'
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

export default async function SettingsPage() {
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
            <p className="text-slate-500 text-sm">Gérez votre compte et préférences</p>
          </div>
        </div>
      </section>

      {/* Informations du compte */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <User size={20} className="text-blue-600" />
          Informations du compte
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
                Plan actuel
              </label>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                profile.plan === 'pro' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                <Shield size={14} />
                <span>Plan {profile.plan === 'pro' ? 'Pro' : 'Gratuit'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          Notifications
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Email de factures envoyées</p>
                <p className="text-sm text-slate-500">Recevoir une notification quand une facture est envoyée</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Notifications mobile</p>
                <p className="text-sm text-slate-500">Alertes pour nouveaux paiements</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Lock size={20} className="text-blue-600" />
          Sécurité
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Connexion sécurisée</p>
                <p className="text-sm text-slate-500">Authentification à deux facteurs activée</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-green-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Appareils connectés</p>
                <p className="text-sm text-slate-500">2 appareils actuellement connectés</p>
              </div>
            </div>
            <Link
              href="/settings/devices"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-all"
            >
              Gérer →
            </Link>
          </div>
        </div>
      </section>

      {/* Actions dangereuses */}
      <section className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-red-900 mb-6 flex items-center gap-2">
          <Trash2 size={20} className="text-red-600" />
          Actions dangereuses
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-xl border border-red-200">
            <div>
              <p className="font-medium text-red-900">Supprimer toutes les factures</p>
              <p className="text-sm text-red-600">Cette action est irréversible</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
              Supprimer
            </button>
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-xl border border-red-200">
            <div>
              <p className="font-medium text-red-900">Supprimer le compte</p>
              <p className="text-sm text-red-600">Toutes vos données seront perdues</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
              Supprimer compte
            </button>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Dernière mise à jour : {formatDate(profile.created_at)}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profil"
              className="tap-target flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-xl transition-all"
            >
              <User size={16} />
              Voir profil
            </Link>
            <button className="tap-target flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-all">
              <Save size={16} />
              Sauvegarder
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
