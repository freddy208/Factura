import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { PLAN_LIMITS, PLAN_PRICING } from '@/lib/limits'
import { tokens } from '@/lib/design-system'
import { 
  Settings, 
  Globe, 
  Mail, 
  Shield, 
  CreditCard, 
  Database, 
  Bell, 
  Download, 
  Upload, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  FileText, 
  Zap, 
  Lock, 
  Key, 
  Eye, 
  EyeOff,
  Smartphone,
  Server,
  Clock,
  BarChart3,
  HelpCircle,
  Info
} from 'lucide-react'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  const adminClient = createAdminClient()

  // Récupération des données de configuration (simulées pour l'exemple)
  const config = {
    general: {
      siteName: "FACTURA",
      siteUrl: "https://factura.app",
      logoUrl: "/logo.png",
      faviconUrl: "/favicon.ico",
      defaultLanguage: "fr",
      timezone: "Europe/Paris",
      maintenanceMode: false,
      betaFeatures: true
    },
    plans: {
      freeLimit: PLAN_LIMITS.free.invoices_per_month,
      freeQuotesLimit: PLAN_LIMITS.free.quotes_per_month,
      freeClientsLimit: PLAN_LIMITS.free.clients_total,
      proPrice: PLAN_PRICING.pro.monthly_eur,
      proPriceFcfa: PLAN_PRICING.pro.monthly_fcfa,
      trialDays: 14,
      autoUpgrade: false
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      passwordMinLength: 8,
      requireStrongPassword: true,
      ipWhitelist: [],
      allowedDomains: []
    },
    email: {
      provider: "resend",
      fromEmail: "noreply@factura.app",
      fromName: "FACTURA",
      smtpHost: "",
      smtpPort: 587,
      smtpUsername: "",
      smtpPassword: "",
      templates: {
        welcome: true,
        invoiceCreated: true,
        paymentReceived: true,
        proActivated: true,
        overdueReminder: true
      }
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      slackWebhook: "",
      discordWebhook: "",
      adminAlerts: true,
      userAlerts: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: "daily",
      retentionDays: 30,
      backupLocation: "cloud",
      lastBackup: new Date().toISOString(),
      nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    api: {
      rateLimitEnabled: true,
      rateLimitPerMinute: 1000,
      apiKeyRequired: false,
      corsEnabled: true,
      allowedOrigins: ["https://factura.app"],
      apiVersion: "v1",
      documentationEnabled: true
    }
  }

  return (
    <div className="space-y-6" role="main" aria-label="Paramètres administrateur">
      {/* Header */}
      <header className="flex items-center justify-between" role="banner">
        <div>
          <h1 className="text-3xl font-bold" style={{color: tokens.colors.gray[900]}}>Paramètres</h1>
          <p className="mt-1" style={{color: tokens.colors.gray[600]}}>Configuration globale de la plateforme FACTURA</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: `2px solid ${tokens.colors.gray[200]}`,
              color: tokens.colors.gray[600]
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.gray[50]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
            }}
            aria-label="Réinitialiser les paramètres"
            role="button"
            tabIndex={0}
          >
            <RefreshCw size={16} />
            <span className="text-sm font-medium">Réinitialiser</span>
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: tokens.colors.primary[600],
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primary[700]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primary[600]
            }}
            aria-label="Sauvegarder les modifications"
            role="button"
            tabIndex={0}
          >
            <Save size={16} />
            <span className="text-sm font-medium">Sauvegarder</span>
          </button>
        </div>
      </header>

      {/* Navigation des paramètres */}
      <nav 
        className="rounded-xl p-1"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${tokens.colors.gray[200]}`
        }}
        role="navigation"
        aria-label="Navigation des sections de paramètres"
      >
        <div className="flex flex-wrap gap-1">
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: tokens.colors.primary[600],
              color: 'white'
            }}
            aria-label="Section Paramètres généraux"
            role="button"
            tabIndex={0}
          >
            <Globe size={16} />
            <span className="text-sm font-medium">Général</span>
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              color: tokens.colors.gray[600]
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.gray[100]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Section Plans et tarifs"
            role="button"
            tabIndex={0}
          >
            <CreditCard size={16} />
            <span className="text-sm font-medium">Plans & Tarifs</span>
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              color: tokens.colors.gray[600]
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.gray[100]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Section Sécurité"
            role="button"
            tabIndex={0}
          >
            <Shield size={16} />
            <span className="text-sm font-medium">Sécurité</span>
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              color: tokens.colors.gray[600]
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.gray[100]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Section Configuration Email"
            role="button"
            tabIndex={0}
          >
            <Mail size={16} />
            <span className="text-sm font-medium">Email</span>
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              color: tokens.colors.gray[600]
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.gray[100]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Section Notifications"
            role="button"
            tabIndex={0}
          >
            <Bell size={16} />
            <span className="text-sm font-medium">Notifications</span>
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              color: tokens.colors.gray[600]
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.gray[100]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Section Sauvegarde"
            role="button"
            tabIndex={0}
          >
            <Database size={16} />
            <span className="text-sm font-medium">Sauvegarde</span>
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              color: tokens.colors.gray[600]
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.gray[100]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Section Configuration API"
            role="button"
            tabIndex={0}
          >
            <Zap size={16} />
            <span className="text-sm font-medium">API</span>
          </button>
        </div>
      </nav>

      {/* Paramètres généraux */}
      <section 
        className="rounded-xl p-6"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${tokens.colors.gray[200]}`
        }}
        role="region"
        aria-labelledby="general-settings-heading"
      >
        <div className="flex items-center gap-3 mb-6">
          <Globe size={20} style={{color: tokens.colors.primary[600]}} />
          <h2 id="general-settings-heading" className="text-xl font-bold" style={{color: tokens.colors.gray[900]}}>Paramètres généraux</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="site-name" className="block text-sm font-medium mb-2" style={{color: tokens.colors.gray[700]}}>
                Nom du site
              </label>
              <input
                id="site-name"
                type="text"
                defaultValue={config.general.siteName}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                aria-describedby="site-name-description"
              />
              <p id="site-name-description" className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>
                Nom affiché dans l'interface et les emails
              </p>
            </div>
            <div>
              <label htmlFor="site-url" className="block text-sm font-medium mb-2" style={{color: tokens.colors.gray[700]}}>
                URL du site
              </label>
              <input
                id="site-url"
                type="url"
                defaultValue={config.general.siteUrl}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                aria-describedby="site-url-description"
              />
              <p id="site-url-description" className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>
                URL principale de la plateforme
              </p>
            </div>
            <div>
              <label htmlFor="default-language" className="block text-sm font-medium mb-2" style={{color: tokens.colors.gray[700]}}>
                Langue par défaut
              </label>
              <select 
                id="default-language"
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                aria-describedby="default-language-description"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
              <p id="default-language-description" className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>
                Langue utilisée par défaut pour l'interface
              </p>
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium mb-2" style={{color: tokens.colors.gray[700]}}>
                Fuseau horaire
              </label>
              <select 
                id="timezone"
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                aria-describedby="timezone-description"
              >
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
              <p id="timezone-description" className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>
                Fuseau horaire pour les dates et heures
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg" style={{backgroundColor: tokens.colors.gray[50]}}>
              <div>
                <h3 className="font-medium" style={{color: tokens.colors.gray[900]}}>Mode maintenance</h3>
                <p className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>Désactive temporairement l'accès à la plateforme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  defaultChecked={config.general.maintenanceMode} 
                  className="sr-only peer"
                  aria-describedby="maintenance-description"
                />
                <div 
                  className="w-11 h-6 rounded-full peer transition-colors"
                  style={{
                    backgroundColor: tokens.colors.gray[200]
                  }}
                >
                  <div 
                    className="absolute top-[2px] left-[2px] bg-white border rounded-full h-5 w-5 transition-all"
                    style={{
                      borderColor: tokens.colors.gray[300]
                    }}
                  />
                </div>
              </label>
              <p id="maintenance-description" className="sr-only">
                Active ou désactive le mode maintenance de la plateforme
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg" style={{backgroundColor: tokens.colors.gray[50]}}>
              <div>
                <h3 className="font-medium" style={{color: tokens.colors.gray[900]}}>Fonctionnalités bêta</h3>
                <p className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>Active les fonctionnalités expérimentales</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  defaultChecked={config.general.betaFeatures} 
                  className="sr-only peer"
                  aria-describedby="beta-features-description"
                />
                <div 
                  className="w-11 h-6 rounded-full peer transition-colors"
                  style={{
                    backgroundColor: tokens.colors.gray[200]
                  }}
                >
                  <div 
                    className="absolute top-[2px] left-[2px] bg-white border rounded-full h-5 w-5 transition-all"
                    style={{
                      borderColor: tokens.colors.gray[300]
                    }}
                  />
                </div>
              </label>
              <p id="beta-features-description" className="sr-only">
                Active ou désactive les fonctionnalités bêta pour les utilisateurs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans & Tarifs */}
      <section 
        className="rounded-xl p-6"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${tokens.colors.gray[200]}`
        }}
        role="region"
        aria-labelledby="plans-pricing-heading"
      >
        <div className="flex items-center gap-3 mb-6">
          <CreditCard size={20} style={{color: tokens.colors.success[600]}} />
          <h2 id="plans-pricing-heading" className="text-xl font-bold" style={{color: tokens.colors.gray[900]}}>Plans & Tarifs</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="free-limit-invoices" className="block text-sm font-medium mb-2" style={{color: tokens.colors.gray[700]}}>
                Limite factures (Free)
              </label>
              <input
                id="free-limit-invoices"
                type="number"
                defaultValue={config.plans.freeLimit}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                aria-describedby="free-limit-invoices-description"
              />
              <p id="free-limit-invoices-description" className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>
                Nombre maximum de factures par mois
              </p>
            </div>
            <div>
              <label htmlFor="free-limit-quotes" className="block text-sm font-medium mb-2" style={{color: tokens.colors.gray[700]}}>
                Limite devis (Free)
              </label>
              <input
                id="free-limit-quotes"
                type="number"
                defaultValue={config.plans.freeQuotesLimit}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                aria-describedby="free-limit-quotes-description"
              />
              <p id="free-limit-quotes-description" className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>
                Nombre maximum de devis par mois
              </p>
            </div>
            <div>
              <label htmlFor="pro-price-eur" className="block text-sm font-medium mb-2" style={{color: tokens.colors.gray[700]}}>
                Prix Pro (€/mois)
              </label>
              <input
                id="pro-price-eur"
                type="number"
                defaultValue={config.plans.proPrice}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                aria-describedby="pro-price-eur-description"
              />
              <p id="pro-price-eur-description" className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>
                Prix mensuel en euros
              </p>
            </div>
            <div>
              <label htmlFor="pro-price-fcfa" className="block text-sm font-medium mb-2" style={{color: tokens.colors.gray[700]}}>
                Prix Pro (FCFA/mois)
              </label>
              <input
                id="pro-price-fcfa"
                type="number"
                defaultValue={config.plans.proPriceFcfa}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                aria-describedby="pro-price-fcfa-description"
              />
              <p id="pro-price-fcfa-description" className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>
                Prix mensuel en francs CFA
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="trial-days" className="block text-sm font-medium mb-2" style={{color: tokens.colors.gray[700]}}>
                Jours d'essai
              </label>
              <input
                id="trial-days"
                type="number"
                defaultValue={config.plans.trialDays}
                className="w-full px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                aria-describedby="trial-days-description"
              />
              <p id="trial-days-description" className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>
                Durée de la période d'essai Pro
              </p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg" style={{backgroundColor: tokens.colors.gray[50]}}>
              <div>
                <h3 className="font-medium" style={{color: tokens.colors.gray[900]}}>Mise à niveau automatique</h3>
                <p className="text-sm mt-1" style={{color: tokens.colors.gray[500]}}>Upgrade automatique des limites dépassées</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  defaultChecked={config.plans.autoUpgrade} 
                  className="sr-only peer"
                  aria-describedby="auto-upgrade-description"
                />
                <div 
                  className="w-11 h-6 rounded-full peer transition-colors"
                  style={{
                    backgroundColor: tokens.colors.gray[200]
                  }}
                >
                  <div 
                    className="absolute top-[2px] left-[2px] bg-white border rounded-full h-5 w-5 transition-all"
                    style={{
                      borderColor: tokens.colors.gray[300]
                    }}
                  />
                </div>
              </label>
              <p id="auto-upgrade-description" className="sr-only">
                Active ou désactive la mise à niveau automatique des utilisateurs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={20} className="text-red-600" />
          <h2 className="text-xl font-bold text-slate-900">Sécurité</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Timeout de session (heures)
              </label>
              <input
                type="number"
                defaultValue={config.security.sessionTimeout}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tentatives de connexion max
              </label>
              <input
                type="number"
                defaultValue={config.security.maxLoginAttempts}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Durée de verrouillage (minutes)
              </label>
              <input
                type="number"
                defaultValue={config.security.lockoutDuration}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">Authentification à deux facteurs</h3>
                <p className="text-sm text-slate-500 mt-1">Renforce la sécurité des comptes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={config.security.twoFactorAuth} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">Mot de passe fort requis</h3>
                <p className="text-sm text-slate-500 mt-1">Exige des mots de passe complexes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={config.security.requireStrongPassword} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Email */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Mail size={20} className="text-amber-600" />
          <h2 className="text-xl font-bold text-slate-900">Configuration Email</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fournisseur
              </label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="resend">Resend</option>
                <option value="smtp">SMTP personnalisé</option>
                <option value="sendgrid">SendGrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email d'envoi
              </label>
              <input
                type="email"
                defaultValue={config.email.fromEmail}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nom d'envoi
              </label>
              <input
                type="text"
                defaultValue={config.email.fromName}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Port SMTP
              </label>
              <input
                type="number"
                defaultValue={config.email.smtpPort}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Templates d'email actifs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(config.email.templates).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-900 capitalize">
                    {key === 'welcome' ? 'Bienvenue' :
                     key === 'invoiceCreated' ? 'Facture créée' :
                     key === 'paymentReceived' ? 'Paiement reçu' :
                     key === 'proActivated' ? 'Activation Pro' :
                     key === 'overdueReminder' ? 'Rappel retard' : key}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={enabled} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={20} className="text-purple-600" />
          <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-600" />
                <div>
                  <h3 className="font-medium text-slate-900">Email</h3>
                  <p className="text-sm text-slate-500">Notifications par email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={config.notifications.emailNotifications} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone size={16} className="text-slate-600" />
                <div>
                  <h3 className="font-medium text-slate-900">Push</h3>
                  <p className="text-sm text-slate-500">Notifications push</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={config.notifications.pushNotifications} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle size={16} className="text-slate-600" />
                <div>
                  <h3 className="font-medium text-slate-900">Alertes admin</h3>
                  <p className="text-sm text-slate-500">Notifications administrateur</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={config.notifications.adminAlerts} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-slate-600" />
                <div>
                  <h3 className="font-medium text-slate-900">Alertes utilisateurs</h3>
                  <p className="text-sm text-slate-500">Notifications utilisateurs</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={config.notifications.userAlerts} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Sauvegarde */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database size={20} className="text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Sauvegarde</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">Sauvegarde automatique</h3>
                <p className="text-sm text-slate-500 mt-1">Sauvegardes programmées</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={config.backup.autoBackup} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fréquence de sauvegarde
              </label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Durée de rétention (jours)
              </label>
              <input
                type="number"
                defaultValue={config.backup.retentionDays}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Emplacement de sauvegarde
              </label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="cloud">Cloud</option>
                <option value="local">Local</option>
                <option value="hybrid">Hybride</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Dernière sauvegarde</h4>
              <p className="text-sm text-slate-600">{formatDate(config.backup.lastBackup)}</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Prochaine sauvegarde</h4>
              <p className="text-sm text-slate-600">{formatDate(config.backup.nextBackup)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={16} />
              <span className="text-sm font-medium">Exporter maintenant</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Upload size={16} />
              <span className="text-sm font-medium">Importer</span>
            </button>
          </div>
        </div>
      </section>

      {/* Actions finales */}
      <section className="flex justify-end gap-3">
        <button className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <RefreshCw size={16} className="text-slate-600" />
          <span className="text-sm font-medium">Réinitialiser</span>
        </button>
        <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Save size={16} />
          <span className="text-sm font-medium">Sauvegarder les modifications</span>
        </button>
      </section>
    </div>
  )
}
