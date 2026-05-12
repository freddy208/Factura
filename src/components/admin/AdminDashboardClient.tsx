'use client'

import { useState, useEffect } from 'react'
import { Users, CheckCircle, Clock, FileText, TrendingUp, Settings, CreditCard, BarChart3, DollarSign, Activity, AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { tokens } from '@/lib/design-system'
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
        totalRevenue: (result.profiles?.filter((p: any) => p.plan === 'pro').length || 0) * 15000 // 15,000 FCFA par mois
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header dashboard */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" role="banner">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{color: tokens.colors.gray[900]}}>Dashboard Admin</h1>
          <p className="text-sm sm:text-base mt-1" style={{color: tokens.colors.gray[600]}}>Vue d'ensemble de la plateforme FACTURA</p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{color: tokens.colors.gray[500]}}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: tokens.colors.success[500]}} aria-hidden="true"></div>
          <span>Temps réel</span>
        </div>
      </header>

      {/* Tableau de bord statistiques premium */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4" role="region" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Statistiques globales de la plateforme</h2>
        <article className="group overflow-hidden rounded-xl border p-3 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-xs uppercase tracking-wide font-medium" style={{color: tokens.colors.gray[600]}}>
              Revenus Totaux
            </p>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: tokens.colors.success[50]}}>
                  <DollarSign size={16} className="md:size-20" style={{color: tokens.colors.success[600]}} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.success[600]}}>{globalStats.totalRevenue.toLocaleString()} FCFA</p>
          </div>
          <p className="text-xs mt-1" style={{color: tokens.colors.gray[500]}}>Estimation mensuelle (FCFA)</p>
        </article>

        <article className="group overflow-hidden rounded-xl border p-3 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-xs uppercase tracking-wide font-medium" style={{color: tokens.colors.gray[600]}}>
              Total Factures
            </p>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: tokens.colors.primary[50]}}>
                  <FileText size={16} className="md:size-20" style={{color: tokens.colors.primary[600]}} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.primary[600]}}>{globalStats.totalInvoices}</p>
          </div>
          <p className="text-xs mt-1" style={{color: tokens.colors.gray[500]}}>{globalStats.totalQuotes} devis</p>
        </article>

        <article className="group overflow-hidden rounded-xl border p-3 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-xs uppercase tracking-wide font-medium" style={{color: tokens.colors.gray[600]}}>
              Plans Pro
            </p>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-sm" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'}}>
                  <CheckCircle size={16} className="md:size-20" style={{color: 'white'}} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.primary[600]}}>{stats.proUsers}</p>
            <span className="text-xs" style={{color: tokens.colors.gray[500]}}>actifs</span>
          </div>
        </article>

        <article className="group overflow-hidden rounded-xl border p-3 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-xs uppercase tracking-wide font-medium" style={{color: tokens.colors.gray[600]}}>
              Plans Free
            </p>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: tokens.colors.gray[100]}}>
                  <Users size={16} className="md:size-20" style={{color: tokens.colors.gray[600]}} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.gray[900]}}>{stats.freeUsers}</p>
            <span className="text-xs" style={{color: tokens.colors.gray[500]}}>actifs</span>
          </div>
        </article>

        <article className="group overflow-hidden rounded-xl border p-3 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" style={{background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', borderColor: tokens.colors.warning[200]}} role="article">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-xs uppercase tracking-wide font-medium" style={{color: tokens.colors.warning[600]}}>
              En Attente
            </p>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-sm" style={{backgroundColor: tokens.colors.warning[500]}}>
                  <Clock size={16} className="md:size-20" style={{color: 'white'}} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.warning[600]}}>{stats.pendingCount}</p>
            <span className="text-xs" style={{color: tokens.colors.warning[500]}}>validations</span>
          </div>
        </article>
      </section>

      {/* Actions rapides */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Demandes en attente */}
        <article className="rounded-xl border shadow-sm" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="region" aria-labelledby="pending-heading">
          <header className="p-4 sm:p-6 border-b" style={{borderColor: tokens.colors.gray[200]}}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: tokens.colors.warning[500]}}>
                  <Clock size={16} className="md:size-20" style={{color: 'white'}} />
                </div>
                <div>
                  <h2 id="pending-heading" className="font-bold" style={{color: tokens.colors.gray[900]}}>Demandes en attente</h2>
                  <p className="text-xs" style={{color: tokens.colors.gray[500]}}>{stats.pendingCount} validation{stats.pendingCount > 1 ? 's' : ''}</p>
                </div>
              </div>
              <Link 
                href="/admin/users" 
                className="text-xs font-medium transition-colors"
                style={{color: tokens.colors.primary[600]}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = tokens.colors.primary[700]
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = tokens.colors.primary[600]
                }}
              >
                Voir tout →
              </Link>
            </div>
          </header>
          
          <div className="p-4 sm:p-6 space-y-3">
            {data.pendingRequests && data.pendingRequests.length > 0 ? (
              data.pendingRequests.slice(0, 3).map((req: any) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg"
                  style={{backgroundColor: tokens.colors.gray[100]}}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: tokens.colors.warning[100]}}>
                      <span className="font-bold text-xs" style={{color: tokens.colors.warning[600]}}>
                        {(req.profiles as any)?.company_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{color: tokens.colors.gray[900]}}>
                        {(req.profiles as any)?.company_name || 'Sans entreprise'}
                      </p>
                      <p className="text-xs" style={{color: tokens.colors.gray[500]}}>{(req.profiles as any)?.email}</p>
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
              <p className="text-center text-sm py-4" style={{color: tokens.colors.gray[500]}}>Aucune demande en attente</p>
            )}
          </div>
        </article>

        {/* Utilisateurs récents */}
        <article className="rounded-xl border shadow-sm" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="region" aria-labelledby="recent-users-heading">
          <header className="p-4 sm:p-6 border-b" style={{borderColor: tokens.colors.gray[200]}}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: tokens.colors.primary[600]}}>
                  <Users size={16} className="sm:size-20" style={{color: 'white'}} />
                </div>
                <div>
                  <h2 id="recent-users-heading" className="font-bold" style={{color: tokens.colors.gray[900]}}>Utilisateurs récents</h2>
                  <p className="text-xs" style={{color: tokens.colors.gray[500]}}>{stats.totalUsers} comptes totaux</p>
                </div>
              </div>
              <Link 
                href="/admin/users" 
                className="text-xs font-medium transition-colors"
                style={{color: tokens.colors.primary[600]}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = tokens.colors.primary[700]
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = tokens.colors.primary[600]
                }}
              >
                Gérer →
              </Link>
            </div>
          </header>
          
          <div className="p-4 sm:p-6 space-y-3">
            {data.profiles && data.profiles.length > 0 ? (
              data.profiles.slice(0, 3).map((profile: any) => (
                <div key={profile.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg" style={{backgroundColor: tokens.colors.gray[100]}}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: tokens.colors.primary[100]}}>
                      <span className="font-bold text-xs" style={{color: tokens.colors.primary[600]}}>
                        {(profile.company_name || profile.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{color: tokens.colors.gray[900]}}>
                        {profile.company_name || 'Sans entreprise'}
                      </p>
                      <p className="text-xs" style={{color: tokens.colors.gray[500]}}>{profile.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {profile.plan === 'pro' ? (
                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{backgroundColor: tokens.colors.primary[100], color: tokens.colors.primary[700]}}>Pro</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{backgroundColor: tokens.colors.gray[100], color: tokens.colors.gray[700]}}>Free</span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{color: tokens.colors.gray[500]}}>Inscrit le {formatDate(profile.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm py-4" style={{color: tokens.colors.gray[500]}}>Aucun utilisateur</p>
            )}
          </div>
        </article>
      </section>

      {/* Navigation rapide */}
      <section className="rounded-xl border p-4 sm:p-6" style={{background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', borderColor: tokens.colors.primary[200]}} role="region" aria-labelledby="nav-heading">
        <h2 id="nav-heading" className="font-bold mb-4" style={{color: tokens.colors.gray[900]}}>Navigation rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link 
            href="/admin/users" 
            className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all hover:-translate-y-1"
            style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: tokens.colors.gray[200]}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primary[50]
              e.currentTarget.style.borderColor = tokens.colors.primary[300]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
              e.currentTarget.style.borderColor = tokens.colors.gray[200]
            }}
          >
            <Users size={20} style={{color: tokens.colors.primary[600]}} />
            <div>
              <p className="font-medium text-sm" style={{color: tokens.colors.gray[900]}}>Utilisateurs</p>
              <p className="text-xs" style={{color: tokens.colors.gray[500]}}>Gérer les comptes</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/plans" 
            className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all hover:-translate-y-1"
            style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: tokens.colors.gray[200]}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primary[50]
              e.currentTarget.style.borderColor = tokens.colors.primary[300]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
              e.currentTarget.style.borderColor = tokens.colors.gray[200]
            }}
          >
            <CreditCard size={20} style={{color: tokens.colors.success[600]}} />
            <div>
              <p className="font-medium text-sm" style={{color: tokens.colors.gray[900]}}>Forfaits</p>
              <p className="text-xs" style={{color: tokens.colors.gray[500]}}>Plans et limites</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/analytics" 
            className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all hover:-translate-y-1"
            style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: tokens.colors.gray[200]}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primary[50]
              e.currentTarget.style.borderColor = tokens.colors.primary[300]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
              e.currentTarget.style.borderColor = tokens.colors.gray[200]
            }}
          >
            <BarChart3 size={20} style={{color: tokens.colors.secondary[600]}} />
            <div>
              <p className="font-medium text-sm" style={{color: tokens.colors.gray[900]}}>Statistiques</p>
              <p className="text-xs" style={{color: tokens.colors.gray[500]}}>Analytics détaillés</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/settings" 
            className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all hover:-translate-y-1"
            style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: tokens.colors.gray[200]}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primary[50]
              e.currentTarget.style.borderColor = tokens.colors.primary[300]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
              e.currentTarget.style.borderColor = tokens.colors.gray[200]
            }}
          >
            <Settings size={20} style={{color: tokens.colors.gray[600]}} />
            <div>
              <p className="font-medium text-sm" style={{color: tokens.colors.gray[900]}}>Paramètres</p>
              <p className="text-xs" style={{color: tokens.colors.gray[500]}}>Configuration</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
