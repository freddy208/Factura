'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Building, Shield, Bell, Lock, Smartphone, Globe, Trash2, Save, CheckCircle, AlertCircle } from 'lucide-react'
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

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: ''
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_invoices: true,
    mobile_alerts: true
  })

  // Security settings
  const [security, setSecurity] = useState({
    two_factor: true
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const profile = profileData as Profile | null
      
      if (!profile) {
        router.push('/onboarding')
        return
      }

      setProfile(profile)
      setFormData({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        email: profile.email
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const updateData = {
        full_name: formData.full_name || null,
        company_name: formData.company_name || null
      }
      
      const { error } = await (supabase.from('profiles') as any)
        .update(updateData)
        .eq('id', user.id)

      if (error) throw error

      // Reload profile to get updated data
      await loadProfile()
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Message de succès/erreur */}
      {message && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

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
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez votre nom complet"
              />
            </div>
            
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block">
                Email
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500">
                {profile.email}
                <span className="text-xs text-slate-400 ml-2">(non modifiable)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block">
                Entreprise
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez le nom de votre entreprise"
              />
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
            <button 
              type="submit"
              disabled={saving}
              className="tap-target flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-4 py-2 rounded-xl transition-all"
            >
              <Save size={16} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </section>
    </form>
  )
}
