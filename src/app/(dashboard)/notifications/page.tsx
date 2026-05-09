import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, CheckCircle, AlertTriangle, Info, Mail, Smartphone, CreditCard, Calendar, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

type Notification = {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  created_at: string
  read: boolean
  action_url?: string
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Simuler des notifications pour la démo
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Facture payée !',
      message: 'La facture FACT-0015 a été payée par Client Tech Solutions',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      action_url: '/factures/FACT-0015'
    },
    {
      id: '2',
      type: 'info',
      title: 'Nouveau devis créé',
      message: 'Le devis DEV-0008 a été créé et envoyé à Client Alpha',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      action_url: '/devis/DEV-0008'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Facture en retard',
      message: 'La facture FACT-0012 est en retard de paiement depuis 5 jours',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      action_url: '/factures/FACT-0012'
    },
    {
      id: '4',
      type: 'info',
      title: 'Mise à jour Pro',
      message: 'Votre compte a été mis à niveau Pro avec succès',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      action_url: '/settings'
    },
    {
      id: '5',
      type: 'error',
      title: 'Erreur de paiement',
      message: 'Le paiement pour la facture FACT-0010 a échoué',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      action_url: '/factures/FACT-0010'
    }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-500 text-sm">Restez informé de l'activité de votre compte</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filtres rapides */}
        <div className="flex items-center gap-2 text-sm">
          <button className="tap-target bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium">
            Toutes
          </button>
          <button className="tap-target bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-200 transition-all">
            Non lues
          </button>
          <button className="tap-target bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-200 transition-all">
            Succès
          </button>
          <button className="tap-target bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-200 transition-all">
            Alertes
          </button>
        </div>
      </section>

      {/* Statistiques */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-blue-600" />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{notifications.length}</p>
          <p className="text-xs text-slate-500">notifications</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Succès</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {notifications.filter(n => n.type === 'success').length}
          </p>
          <p className="text-xs text-slate-500">notifications</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Alertes</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {notifications.filter(n => n.type === 'warning').length}
          </p>
          <p className="text-xs text-slate-500">notifications</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <Info size={16} className="text-red-600" />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Erreurs</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {notifications.filter(n => n.type === 'error').length}
          </p>
          <p className="text-xs text-slate-500">notifications</p>
        </div>
      </section>

      {/* Liste des notifications */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          Historique des notifications
        </h2>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`group flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                notification.read 
                  ? 'bg-slate-50 border-slate-100' 
                  : 'bg-white border-slate-200 hover:border-blue-200'
              }`}
            >
              {/* Icône et statut */}
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  notification.type === 'success' ? 'bg-green-50' :
                  notification.type === 'warning' ? 'bg-amber-50' :
                  notification.type === 'error' ? 'bg-red-50' :
                  'bg-blue-50'
                }`}>
                  {notification.type === 'success' && <CheckCircle size={20} className="text-green-600" />}
                  {notification.type === 'warning' && <AlertTriangle size={20} className="text-amber-600" />}
                  {notification.type === 'error' && <Info size={20} className="text-red-600" />}
                  {notification.type === 'info' && <Bell size={20} className="text-blue-600" />}
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full -mt-2 -ml-4"></div>
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {notification.title}
                  </h3>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  {notification.message}
                </p>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  {notification.action_url && (
                    <Link
                      href={notification.action_url}
                      className="tap-target inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                    >
                      Voir
                    </Link>
                  )}
                  <button className="tap-target text-slate-400 hover:text-slate-600 text-xs font-medium transition-all">
                    {notification.read ? 'Marquer comme non lue' : 'Marquer comme lue'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Paramètres de notification */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Smartphone size={20} className="text-blue-600" />
          Préférences de notification
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Email de factures envoyées</p>
                <p className="text-sm text-slate-500">Recevoir une confirmation par email</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Paiements reçus</p>
                <p className="text-sm text-slate-500">Alerte quand un client paie</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Rappels de paiement</p>
                <p className="text-sm text-slate-500">3 jours avant échéance</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
