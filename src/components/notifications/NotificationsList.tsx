'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertTriangle, Info, Mail, Smartphone, CreditCard, Calendar, TrendingUp, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { validateAndSanitizeNotification } from '@/lib/security/sanitize'
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

type FilterType = 'all' | 'unread' | 'success' | 'warning' | 'error'

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Valider et nettoyer chaque notification
        const sanitizedNotifications = data.notifications.map(validateAndSanitizeNotification)
        setNotifications(sanitizedNotifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string, read: boolean) => {
    try {
      setActionLoading(notificationId)
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read })
      })
      
      if (response.ok) {
        // Mettre à jour l'état local
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read } : n)
        )
      }
    } catch (error) {
      console.error('Error marking notification:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const filters: { key: FilterType, label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'unread', label: 'Non lues' },
    { key: 'success', label: 'Succès' },
    { key: 'warning', label: 'Alertes' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6" role="region" aria-labelledby="notifications-title">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg" aria-hidden="true">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <h1 id="notifications-title" className="text-2xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-500 text-sm">Restez informé de l'activité de votre compte</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full" aria-live="polite" aria-atomic="true">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filtres rapides */}
        <div role="group" aria-label="Filtres de notifications" className="flex items-center gap-2 text-sm flex-wrap">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`tap-target min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg font-medium transition-all ${
                filter === key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              aria-label={`Filtrer par ${label}`}
              aria-pressed={filter === key}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Statistiques */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Statistiques des notifications</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-2xl flex items-center justify-center" aria-hidden="true">
              <Mail size={16} className="text-blue-600" />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900" aria-live="polite">{notifications.length}</p>
          <p className="text-xs text-slate-500">notifications</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-50 rounded-2xl flex items-center justify-center" aria-hidden="true">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Succès</span>
          </div>
          <p className="text-2xl font-bold text-green-600" aria-live="polite">
            {notifications.filter(n => n.type === 'success').length}
          </p>
          <p className="text-xs text-slate-500">notifications</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-50 rounded-2xl flex items-center justify-center" aria-hidden="true">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Alertes</span>
          </div>
          <p className="text-2xl font-bold text-amber-600" aria-live="polite">
            {notifications.filter(n => n.type === 'warning').length}
          </p>
          <p className="text-xs text-slate-500">notifications</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-50 rounded-2xl flex items-center justify-center" aria-hidden="true">
              <Info size={16} className="text-red-600" />
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Erreurs</span>
          </div>
          <p className="text-2xl font-bold text-red-600" aria-live="polite">
            {notifications.filter(n => n.type === 'error').length}
          </p>
          <p className="text-xs text-slate-500">notifications</p>
        </div>
      </section>

      {/* Liste des notifications */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6" role="region" aria-labelledby="history-title">
        <h2 id="history-title" className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Bell size={20} className="text-blue-600" aria-hidden="true" />
          Historique des notifications
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12" aria-live="polite">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="ml-2 text-slate-600">Chargement...</span>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Liste des notifications">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                  notification.read 
                    ? 'bg-slate-50 border-slate-100' 
                    : 'bg-white border-slate-200 hover:border-blue-200'
                }`}
                role="listitem"
                aria-labelledby={`notification-title-${notification.id}`}
                aria-describedby={`notification-message-${notification.id}`}
              >
                {/* Icône et statut */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    notification.type === 'success' ? 'bg-green-50' :
                    notification.type === 'warning' ? 'bg-amber-50' :
                    notification.type === 'error' ? 'bg-red-50' :
                    'bg-blue-50'
                  }`} aria-hidden="true">
                    {notification.type === 'success' && <CheckCircle size={20} className="text-green-600" />}
                    {notification.type === 'warning' && <AlertTriangle size={20} className="text-amber-600" />}
                    {notification.type === 'error' && <Info size={20} className="text-red-600" />}
                    {notification.type === 'info' && <Bell size={20} className="text-blue-600" />}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full -mt-2 -ml-4" aria-label="Notification non lue"></div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 id={`notification-title-${notification.id}`} className="font-semibold text-slate-900 text-sm break-words" title={notification.title}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <p id={`notification-message-${notification.id}`} className="text-slate-600 text-sm leading-relaxed mb-3 break-words">
                    {notification.message}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {notification.action_url && (
                      <Link
                        href={notification.action_url}
                        className="tap-target inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all min-h-[32px]"
                        aria-label={`Voir les détails: ${notification.title}`}
                      >
                        Voir
                      </Link>
                    )}
                    <button
                      onClick={() => markAsRead(notification.id, !notification.read)}
                      disabled={actionLoading === notification.id}
                      className="tap-target text-slate-400 hover:text-slate-600 text-xs font-medium transition-all min-h-[32px] min-w-[32px] px-2 py-1.5 rounded disabled:opacity-50"
                      aria-label={`Marquer comme ${notification.read ? 'non lue' : 'lue'}: ${notification.title}`}
                    >
                      {actionLoading === notification.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        notification.read ? 'Marquer comme non lue' : 'Marquer comme lue'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <div className="w-12 h-6 bg-blue-600 rounded-2xl relative cursor-pointer">
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
            <div className="w-12 h-6 bg-blue-600 rounded-2xl relative cursor-pointer">
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
            <div className="w-12 h-6 bg-slate-300 rounded-2xl relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
