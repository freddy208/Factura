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
  
  // Form state with validation feedback
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: ''
  })

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({})

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_invoices: true,
    mobile_alerts: true
  })

  // Security settings
  const [security, setSecurity] = useState({
    two_factor: true
  })

  // Loading states for actions
  const [actionLoading, setActionLoading] = useState({
    deleteInvoices: false,
    deleteAccount: false,
    updateNotifications: false,
    updateSecurity: false
  })

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'deleteInvoices' | 'deleteAccount' | null
    open: boolean
  }>({ type: null, open: false })

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

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    setActionLoading(prev => ({ ...prev, updateNotifications: true }))
    try {
      const newValue = !notifications[key]
      setNotifications(prev => ({ ...prev, [key]: newValue }))
      
      // TODO: Save to database
      setMessage({ type: 'success', text: `Notifications ${key} ${newValue ? 'activées' : 'désactivées'}` })
    } catch (error) {
      console.error('Error updating notifications:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour des notifications' })
      // Revert on error
      setNotifications(prev => ({ ...prev, [key]: !notifications[key] }))
    } finally {
      setActionLoading(prev => ({ ...prev, updateNotifications: false }))
    }
  }

  const handleSecurityToggle = async (key: keyof typeof security) => {
    setActionLoading(prev => ({ ...prev, updateSecurity: true }))
    try {
      const newValue = !security[key]
      setSecurity(prev => ({ ...prev, [key]: newValue }))
      
      // TODO: Save to database
      setMessage({ type: 'success', text: `Sécurité ${key} ${newValue ? 'activée' : 'désactivée'}` })
    } catch (error) {
      console.error('Error updating security:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour de la sécurité' })
      // Revert on error
      setSecurity(prev => ({ ...prev, [key]: !security[key] }))
    } finally {
      setActionLoading(prev => ({ ...prev, updateSecurity: false }))
    }
  }

  const handleDeleteInvoices = async () => {
    setActionLoading(prev => ({ ...prev, deleteInvoices: true }))
    try {
      // TODO: Implement deletion logic
      setMessage({ type: 'success', text: 'Toutes les factures ont été supprimées' })
      setConfirmDialog({ type: null, open: false })
    } catch (error) {
      console.error('Error deleting invoices:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression des factures' })
    } finally {
      setActionLoading(prev => ({ ...prev, deleteInvoices: false }))
    }
  }

  const handleDeleteAccount = async () => {
    setActionLoading(prev => ({ ...prev, deleteAccount: true }))
    try {
      // TODO: Implement account deletion logic
      setMessage({ type: 'success', text: 'Votre compte a été supprimé' })
      setConfirmDialog({ type: null, open: false })
      // Redirect to home after delay
      setTimeout(() => router.push('/'), 2000)
    } catch (error) {
      console.error('Error deleting account:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression du compte' })
    } finally {
      setActionLoading(prev => ({ ...prev, deleteAccount: false }))
    }
  }

  // Client-side validation with feedback
  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {}
    
    if (name === 'full_name' && value) {
      if (value.length > 100) {
        errors.full_name = 'Le nom complet ne peut pas dépasser 100 caractères'
      } else if (value.length < 2) {
        errors.full_name = 'Le nom complet doit contenir au moins 2 caractères'
      }
    }
    
    if (name === 'company_name' && value) {
      if (value.length > 100) {
        errors.company_name = 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères'
      } else if (value.length < 2) {
        errors.company_name = 'Le nom de l\'entreprise doit contenir au moins 2 caractères'
      }
    }
    
    setFormErrors(prev => ({ ...prev, ...errors }))
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormTouched(prev => ({ ...prev, [name]: true }))
    
    // Validate on change if field has been touched
    if (formTouched[name]) {
      validateField(name, value)
    }
  }

  const handleInputBlur = (name: string, value: string) => {
    setFormTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      // Validate all fields
      const fullNameValid = validateField('full_name', formData.full_name)
      const companyNameValid = validateField('company_name', formData.company_name)
      
      if (!fullNameValid || !companyNameValid) {
        setMessage({ type: 'error', text: 'Veuillez corriger les erreurs dans le formulaire' })
        setSaving(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const updateData = {
        full_name: formData.full_name?.trim() || null,
        company_name: formData.company_name?.trim() || null
      }
      
      const { error } = await (supabase.from('profiles') as any)
        .update(updateData)
        .eq('id', user.id)

      if (error) throw error

      // Reload profile to get updated data
      await loadProfile()
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
      
      // Clear form errors on success
      setFormErrors({})
      setFormTouched({})
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
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Paramètres</h1>
            <p className="text-slate-500 text-sm">Gérez votre compte et préférences</p>
          </div>
        </div>
      </section>

      {/* Informations du compte */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
          <User size={20} className="text-blue-600" />
          Informations du compte
        </h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block">
                Nom complet
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  onBlur={(e) => handleInputBlur('full_name', e.target.value)}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-base sm:text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                    formErrors.full_name && formTouched.full_name
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent focus:bg-white'
                  }`}
                  placeholder="Entrez votre nom complet"
                  aria-label="Nom complet"
                  aria-describedby="full-name-help full-name-error"
                  aria-invalid={!!formErrors.full_name && formTouched.full_name}
                />
                {formErrors.full_name && formTouched.full_name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              <p id="full-name-help" className="mt-1 text-xs text-slate-500">Maximum 100 caractères</p>
              {formErrors.full_name && formTouched.full_name && (
                <p id="full-name-error" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {formErrors.full_name}
                </p>
              )}
            </div>
            
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block">
                Email
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 text-base sm:text-sm" role="status" aria-live="polite">
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
              <div className="relative">
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  onBlur={(e) => handleInputBlur('company_name', e.target.value)}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-base sm:text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                    formErrors.company_name && formTouched.company_name
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent focus:bg-white'
                  }`}
                  placeholder="Entrez le nom de votre entreprise"
                  aria-label="Nom de l'entreprise"
                  aria-describedby="company-name-help company-name-error"
                  aria-invalid={!!formErrors.company_name && formTouched.company_name}
                />
                {formErrors.company_name && formTouched.company_name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              <p id="company-name-help" className="mt-1 text-xs text-slate-500">Maximum 100 caractères</p>
              {formErrors.company_name && formTouched.company_name && (
                <p id="company-name-error" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {formErrors.company_name}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2 block">
                Plan actuel
              </label>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                profile.plan === 'pro' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600'
              }`} role="status" aria-live="polite">
                <Shield size={14} />
                <span>Plan {profile.plan === 'pro' ? 'Pro' : 'Gratuit'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          Notifications
        </h2>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Email de factures envoyées</p>
                <p className="text-sm text-slate-500">Recevoir une notification quand une facture est envoyée</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle('email_invoices')}
              disabled={actionLoading.updateNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                notifications.email_invoices ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              aria-label="Toggle email notifications"
              aria-checked={notifications.email_invoices}
              role="switch"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.email_invoices ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Notifications mobile</p>
                <p className="text-sm text-slate-500">Alertes pour nouveaux paiements</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle('mobile_alerts')}
              disabled={actionLoading.updateNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                notifications.mobile_alerts ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              aria-label="Toggle mobile notifications"
              aria-checked={notifications.mobile_alerts}
              role="switch"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.mobile_alerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
          <Lock size={20} className="text-blue-600" />
          Sécurité
        </h2>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Connexion sécurisée</p>
                <p className="text-sm text-slate-500">Authentification à deux facteurs activée</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSecurityToggle('two_factor')}
              disabled={actionLoading.updateSecurity}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                security.two_factor ? 'bg-green-600' : 'bg-gray-200'
              }`}
              aria-label="Toggle two factor authentication"
              aria-checked={security.two_factor}
              role="switch"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  security.two_factor ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
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
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Gérer les appareils connectés"
            >
              Gérer →
            </Link>
          </div>
        </div>
      </section>

      {/* Actions dangereuses */}
      <section className="bg-white rounded-2xl border border-red-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-bold text-red-900 mb-4 sm:mb-6 flex items-center gap-2">
          <Trash2 size={20} className="text-red-600" />
          Actions dangereuses
        </h2>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 px-4 bg-red-50 rounded-xl border border-red-200">
            <div>
              <p className="font-medium text-red-900">Supprimer toutes les factures</p>
              <p className="text-sm text-red-600">Cette action est irréversible</p>
            </div>
            <button 
              type="button"
              onClick={() => setConfirmDialog({ type: 'deleteInvoices', open: true })}
              disabled={actionLoading.deleteInvoices}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Supprimer toutes les factures"
            >
              {actionLoading.deleteInvoices ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Supprimer'
              )}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 px-4 bg-red-50 rounded-xl border border-red-200">
            <div>
              <p className="font-medium text-red-900">Supprimer le compte</p>
              <p className="text-sm text-red-600">Toutes vos données seront perdues</p>
            </div>
            <button 
              type="button"
              onClick={() => setConfirmDialog({ type: 'deleteAccount', open: true })}
              disabled={actionLoading.deleteAccount}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Supprimer le compte"
            >
              {actionLoading.deleteAccount ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Supprimer compte'
              )}
            </button>
          </div>
        </div>
      </section>

<section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
  <div className="flex flex-col gap-4">
    
    {/* Texte date */}
    <p className="text-sm text-slate-500 text-center sm:text-left">
      Dernière mise à jour : {formatDate(profile.created_at)}
    </p>

    {/* Boutons */}
    <div className="flex flex-col sm:flex-row gap-3">
      <Link
        href="/profil"
        className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 
                   text-slate-700 font-medium px-4 py-3 rounded-xl transition-all w-full sm:w-auto"
        aria-label="Voir le profil"
      >
        <User size={16} />
        Voir profil
      </Link>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 
                   disabled:bg-blue-400 text-white font-medium px-4 py-3 rounded-xl 
                   transition-all w-full sm:w-auto"
        aria-label="Sauvegarder les modifications"
      >
        <Save size={16} />
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>

  </div>
</section>

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {confirmDialog.type === 'deleteInvoices' ? 'Supprimer toutes les factures ?' : 'Supprimer votre compte ?'}
            </h3>
            <p className="text-slate-600 mb-6">
              {confirmDialog.type === 'deleteInvoices' 
                ? 'Cette action supprimera définitivement toutes vos factures. Cette action ne peut pas être annulée.'
                : 'Cette action supprimera définitivement votre compte et toutes vos données. Cette action ne peut pas être annulée.'
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDialog({ type: null, open: false })}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all min-h-[44px] min-w-[44px]"
                aria-label="Annuler"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDialog.type === 'deleteInvoices' ? handleDeleteInvoices : handleDeleteAccount}
                disabled={actionLoading.deleteInvoices || actionLoading.deleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-medium transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Confirmer la suppression"
              >
                {(actionLoading.deleteInvoices || actionLoading.deleteAccount) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Confirmer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
