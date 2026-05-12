'use client'

import { useState, useEffect } from 'react'
import { AdminActivateButton } from '@/components/admin/AdminActivateButton'
import { UserSkeletonLoader } from '@/components/admin/UserSkeletonLoader'
import { formatDate } from '@/lib/utils'
import { PLAN_LIMITS, checkUserLimits, calculateMonthlyStats, PlanType } from '@/lib/limits'
import { tokens } from '@/lib/design-system'
import { CheckCircle, FileText, TrendingUp, DollarSign, Activity, Users } from 'lucide-react'
import { UserStatsCard } from '@/components/admin/UserStatsCard'

interface UsersListClientProps {
  profiles: any[]
  invoices: any[]
  clients: any[]
}

export function UsersListClient({ profiles, invoices, clients }: UsersListClientProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulation du chargement (à remplacer par le vrai état de chargement)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200) // 1.2 secondes de simulation
    
    return () => clearTimeout(timer)
  }, [])

  // Calcul des statistiques mensuelles avec la fonction centralisée
  function calculateUserStats(userId: string) {
    const monthlyStats = calculateMonthlyStats(invoices || [], userId)
    const userClients = clients?.filter((client: any) => client.user_id === userId) || []
    const currentMonth = new Date()
    const userInvoices = invoices?.filter((inv: any) => 
      inv.user_id === userId && 
      new Date(inv.created_at).getMonth() === currentMonth.getMonth() &&
      new Date(inv.created_at).getFullYear() === currentMonth.getFullYear()
    ) || []
    
    return {
      totalInvoices: monthlyStats.invoices,
      totalQuotes: monthlyStats.quotes,
      paidInvoices: monthlyStats.paidInvoices,
      totalRevenue: monthlyStats.revenue,
      totalClients: userClients.length,
      lastActivity: userInvoices.length > 0 ? 
        new Date(Math.max(...userInvoices.map((inv: any) => new Date(inv.created_at).getTime()))) : 
        null
    }
  }

  if (isLoading) {
    return <UserSkeletonLoader count={profiles?.length || 5} />
  }

  return (
    <div className="divide-y" style={{borderColor: tokens.colors.gray[200]}}>
      {profiles?.map((profile: any, index: number) => {
        const stats = calculateUserStats(profile.id)
        const userLimits = checkUserLimits(
          profile.plan as PlanType,
          stats.totalInvoices,
          stats.totalQuotes,
          stats.totalClients
        )
        const isNearLimit = userLimits.invoices.isNearLimit || userLimits.quotes.isNearLimit || userLimits.clients.isNearLimit
        const isOverLimit = userLimits.invoices.isOverLimit || userLimits.quotes.isOverLimit || userLimits.clients.isOverLimit
        const isActive = stats.lastActivity && (Date.now() - stats.lastActivity.getTime()) < 7 * 24 * 60 * 60 * 1000
        
        return (
          <article
            key={profile.id}
            className={`p-6 transition-all duration-200 ${
              index % 2 === 0 ? '' : ''
            }`}
            style={{
              backgroundColor: index % 2 === 0 ? tokens.colors.gray[50] : tokens.colors.gray[100]
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primary[50]
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = index % 2 === 0 ? tokens.colors.gray[50] : tokens.colors.gray[100]
            }}
            role="article"
            aria-labelledby={`user-${profile.id}-name`}
            tabIndex={0}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                    }}
                    aria-hidden="true"
                  >
                    <span className="text-white font-bold text-lg">
                      {(profile.company_name || profile.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {profile.plan === 'pro' && (
                    <div 
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2"
                      style={{
                        backgroundColor: tokens.colors.success[500],
                        borderColor: tokens.colors.gray[50]
                      }}
                      aria-hidden="true"
                    >
                      <CheckCircle size={10} style={{color: tokens.colors.gray[50]}} />
                    </div>
                  )}
                  {isActive && (
                    <div 
                      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full animate-pulse border-2"
                      style={{
                        backgroundColor: tokens.colors.success[400],
                        borderColor: tokens.colors.gray[50]
                      }}
                      aria-hidden="true"
                    ></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p 
                      id={`user-${profile.id}-name`}
                      className="font-semibold"
                      style={{color: tokens.colors.gray[900]}}
                    >
                      {profile.company_name || 'Sans entreprise'}
                    </p>
                    {profile.plan === 'pro' && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: tokens.colors.primary[100],
                          color: tokens.colors.primary[700]
                        }}
                        aria-label="Plan Pro"
                        role="status"
                      >
                        Pro
                      </span>
                    )}
                    {isActive && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: tokens.colors.success[100],
                          color: tokens.colors.success[700]
                        }}
                        aria-label="Utilisateur actif"
                        role="status"
                      >
                        Actif
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{color: tokens.colors.gray[600]}}>{profile.email}</p>
                  <div className="flex items-center gap-4 text-xs mt-2" style={{color: tokens.colors.gray[500]}}>
                    <span>Inscrit le {formatDate(profile.created_at)}</span>
                    {profile.pro_activated_at && (
                      <span>Pro depuis {formatDate(profile.pro_activated_at)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {profile.plan === 'pro' ? (
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{
                      backgroundColor: tokens.colors.success[50],
                      border: `1px solid ${tokens.colors.success[200]}`
                    }}
                    role="status"
                    aria-label="Plan Pro actif"
                  >
                    <CheckCircle size={14} style={{color: tokens.colors.success[600]}} aria-hidden="true" />
                    <span className="text-xs font-semibold" style={{color: tokens.colors.success[700]}}>Plan Pro</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span 
                      className="text-xs font-medium px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: tokens.colors.gray[100],
                        color: tokens.colors.gray[400]
                      }}
                      role="status"
                      aria-label="Plan Free"
                    >
                      Free
                    </span>
                    {isOverLimit && (
                      <span 
                        className="text-xs font-semibold"
                        style={{color: tokens.colors.error[600]}}
                        role="alert"
                        aria-live="polite"
                      >
                        ⚠️ Limites dépassées
                      </span>
                    )}
                    <AdminActivateButton
                      userId={profile.id}
                      requestId={null}
                      userEmail={profile.email}
                      compact
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div 
              className="grid grid-cols-2 md:grid-cols-5 gap-3"
              role="group"
              aria-label={`Statistiques pour ${profile.company_name || profile.email}`}
            >
              <UserStatsCard
                title="Factures"
                value={`${stats.totalInvoices}/${userLimits.invoices.limit === Infinity ? '∞' : userLimits.invoices.limit}`}
                subtitle={`${stats.totalQuotes}/${userLimits.quotes.limit === Infinity ? '∞' : userLimits.quotes.limit} devis`}
                icon={FileText}
                color={isOverLimit ? 'red' : isNearLimit ? 'amber' : 'blue'}
              />
              
              <UserStatsCard
                title="Revenus"
                value={`${stats.totalRevenue.toLocaleString()}€`}
                subtitle={`${stats.paidInvoices} payées`}
                icon={DollarSign}
                color="green"
              />
              
              <UserStatsCard
                title="Clients"
                value={stats.totalClients.toString()}
                subtitle="total"
                icon={Users}
                color="blue"
              />
              
              <UserStatsCard
                title="Performance"
                value={(stats.totalInvoices + stats.totalQuotes).toString()}
                subtitle="documents"
                icon={TrendingUp}
                color="purple"
              />
              
              <UserStatsCard
                title="Dernière activité"
                value={stats.lastActivity ? formatDate(stats.lastActivity.toISOString()) : 'Jamais'}
                subtitle={isActive ? 'Actif' : 'Inactif'}
                icon={Activity}
                color={isActive ? 'green' : 'slate'}
              />
            </div>
          </article>
        )
      })}
    </div>
  )
}
