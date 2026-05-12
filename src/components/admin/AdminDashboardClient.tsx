'use client'

import { useState, useEffect } from 'react'
import { Users, CheckCircle, Clock, FileText, TrendingUp, Settings, CreditCard, BarChart3, DollarSign, Activity, AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { AdminActivateButton } from '@/components/admin/AdminActivateButton'

interface DashboardData {
  profiles: any[]
  pendingRequests: any[]
  loading: boolean
  error: string | null
}

export function AdminDashboardClient() {
  const [data, setData] = useState<DashboardData>({
    profiles: [],
    pendingRequests: [],
    loading: true,
    error: null
  })

  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    freeUsers: 0,
    pendingCount: 0,
    totalRevenue: 0
  })

  // Fonction pour charger les données avec retry 
  const loadData = async (retryCount = 0) => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))
      
      // Créer un timeout manuellement pour compatibilité
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('/api/admin/dashboard-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      setData({
        profiles: result.profiles || [],
        pendingRequests: result.pendingRequests || [],
        loading: false,
        error: null
      })

      setStats({
        totalUsers: result.profiles?.length || 0,
        proUsers: result.profiles?.filter((p: any) => p.plan === 'pro').length || 0,
        freeUsers: (result.profiles?.length || 0) - (result.profiles?.filter((p: any) => p.plan === 'pro').length || 0),
        pendingCount: result.pendingRequests?.length || 0,
        totalRevenue: (result.profiles?.filter((p: any) => p.plan === 'pro').length || 0) * 29
      })

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      
      // Retry automatique (max 3 tentatives)
      if (retryCount < 3) {
        setTimeout(() => loadData(retryCount + 1), 2000 * (retryCount + 1))
        return
      }

      setData({
        profiles: [],
        pendingRequests: [],
        loading: false,
        error: 'Impossible de charger les données. Veuillez réessayer.'
      })
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const globalStats = {
    totalInvoices: 0,
    totalQuotes: 0,
    totalRevenue: stats.totalRevenue,
    totalClients: 0,
    activeUsers: stats.totalUsers
  }

  if (data.loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin</h1>
            <p className="text-slate-600 mt-1">Vue d'ensemble de la plateforme FACTURA</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw className="animate-spin" size={16} />
            <span>Chargement...</span>
          </div>
        </div>

        {/* Skeleton loader */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="h-4 bg-slate-200 rounded w-20 mb-3"></div>
                <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin</h1>
            <p className="text-slate-600 mt-1">Vue d'ensemble de la plateforme FACTURA</p>
          </div>
          <button 
            onClick={() => loadData()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Réessayer</span>
          </button>
        </div>

        {/* Error message */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Erreur de chargement</h3>
              <p className="text-red-700 text-sm mt-1">{data.error}</p>
            </div>
          </div>
        </div>

        {/* Navigation rapide même en cas d'erreur */}
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Navigation rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/admin/users" 
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-blue-50 transition-colors"
            >
              <Users size={20} className="text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">Utilisateurs</p>
                <p className="text-xs text-slate-500">Gérer les comptes</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/plans" 
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-blue-50 transition-colors"
            >
              <CreditCard size={20} className="text-green-600" />
              <div>
                <p className="font-medium text-slate-900">Forfaits</p>
                <p className="text-xs text-slate-500">Plans et limites</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/analytics" 
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-blue-50 transition-colors"
            >
              <BarChart3 size={20} className="text-purple-600" />
              <div>
                <p className="font-medium text-slate-900">Statistiques</p>
                <p className="text-xs text-slate-500">Analytics détaillés</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/settings" 
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-blue-50 transition-colors"
            >
              <Settings size={20} className="text-slate-600" />
              <div>
                <p className="font-medium text-slate-900">Paramètres</p>
                <p className="text-xs text-slate-500">Configuration</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin</h1>
          <p className="text-slate-600 mt-1">Vue d'ensemble de la plateforme FACTURA</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Temps réel</span>
        </div>
      </div>

      {/* Tableau de bord statistiques premium */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
              Revenus Totaux
            </p>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={16} className="text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-green-600">{globalStats.totalRevenue.toLocaleString()}€</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">Estimation mensuelle</p>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
              Total Factures
            </p>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-blue-600">{globalStats.totalInvoices}</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">{globalStats.totalQuotes} devis</p>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
              Plans Pro
            </p>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <CheckCircle size={16} className="text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-blue-600">{stats.proUsers}</p>
            <span className="text-xs text-slate-500">actifs</span>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
              Plans Free
            </p>
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-slate-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-slate-900">{stats.freeUsers}</p>
            <span className="text-xs text-slate-500">actifs</span>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-amber-600 uppercase tracking-wide font-medium">
              En Attente
            </p>
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm">
              <Clock size={16} className="text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
            <span className="text-xs text-amber-500">validations</span>
          </div>
        </div>
      </section>

      {/* Actions rapides */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demandes en attente */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Clock size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Demandes en attente</h2>
                  <p className="text-xs text-slate-500">{stats.pendingCount} validation{stats.pendingCount > 1 ? 's' : ''}</p>
                </div>
              </div>
              <Link 
                href="/admin/users" 
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir tout →
              </Link>
            </div>
          </div>
          
          <div className="p-6 space-y-3">
            {data.pendingRequests && data.pendingRequests.length > 0 ? (
              data.pendingRequests.slice(0, 3).map((req: any) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
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
                      <p className="text-xs text-slate-500">{(req.profiles as any)?.email}</p>
                    </div>
                  </div>
                  <AdminActivateButton
                    userId={req.user_id}
                    requestId={req.id}
                    userEmail={(req.profiles as any)?.email}
                    compact
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 text-sm py-4">Aucune demande en attente</p>
            )}
          </div>
        </div>

        {/* Utilisateurs récents */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Utilisateurs récents</h2>
                  <p className="text-xs text-slate-500">{stats.totalUsers} comptes totaux</p>
                </div>
              </div>
              <Link 
                href="/admin/users" 
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Gérer →
              </Link>
            </div>
          </div>
          
          <div className="p-6 space-y-3">
            {data.profiles && data.profiles.length > 0 ? (
              data.profiles.slice(0, 3).map((profile: any) => (
                <div key={profile.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">
                        {(profile.company_name || profile.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {profile.company_name || 'Sans entreprise'}
                      </p>
                      <p className="text-xs text-slate-500">{profile.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {profile.plan === 'pro' ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Pro</span>
                      ) : (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-medium">Free</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Inscrit le {formatDate(profile.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 text-sm py-4">Aucun utilisateur</p>
            )}
          </div>
        </div>
      </section>

      {/* Navigation rapide */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <h2 className="font-bold text-slate-900 mb-4">Navigation rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/admin/users" 
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-blue-50 transition-colors"
          >
            <Users size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-slate-900">Utilisateurs</p>
              <p className="text-xs text-slate-500">Gérer les comptes</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/plans" 
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-blue-50 transition-colors"
          >
            <CreditCard size={20} className="text-green-600" />
            <div>
              <p className="font-medium text-slate-900">Forfaits</p>
              <p className="text-xs text-slate-500">Plans et limites</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/analytics" 
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-blue-50 transition-colors"
          >
            <BarChart3 size={20} className="text-purple-600" />
            <div>
              <p className="font-medium text-slate-900">Statistiques</p>
              <p className="text-xs text-slate-500">Analytics détaillés</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/settings" 
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:bg-blue-50 transition-colors"
          >
            <Settings size={20} className="text-slate-600" />
            <div>
              <p className="font-medium text-slate-900">Paramètres</p>
              <p className="text-xs text-slate-500">Configuration</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
