'use client'

import { useState } from 'react'
import { Users, CheckCircle, Clock, Search, Filter, Download } from 'lucide-react'
import { tokens } from '@/lib/design-system'
import { UsersListClient } from '@/components/admin/UsersListClient'

interface AdminUsersPageClientProps {
  profiles: any[]
  invoices: any[]
  clients: any[]
  totalUsers: number
  proUsers: number
  freeUsers: number
  pendingCount: number
  globalStats: {
    totalInvoices: number
    totalQuotes: number
    totalRevenue: number
    totalClients: number
    activeUsers: number
  }
}

export function AdminUsersPageClient({
  profiles,
  invoices,
  clients,
  totalUsers,
  proUsers,
  freeUsers,
  pendingCount,
  globalStats
}: AdminUsersPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const handleExport = () => {
    // Export functionality
    console.log('Exporting users...')
  }

  const handleFilter = () => {
    // Filter functionality
    console.log('Applying filters:', { searchTerm, planFilter, statusFilter })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" role="banner">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{color: tokens.colors.gray[900]}}>Gestion des Utilisateurs</h1>
          <p className="text-sm sm:text-base mt-1" style={{color: tokens.colors.gray[600]}}>Administration complète des comptes FACTURA</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            style={{
              backgroundColor: tokens.colors.gray[50],
              border: `1px solid ${tokens.colors.gray[200]}`,
              color: tokens.colors.gray[700]
            }}
            onClick={handleExport}
            aria-label="Exporter la liste des utilisateurs"
            role="button"
            tabIndex={0}
          >
            <Download size={14} className="sm:size-16" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-medium">Exporter</span>
          </button>
          <div className="flex items-center gap-2 text-xs" style={{color: tokens.colors.gray[500]}} role="status" aria-live="polite">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: tokens.colors.success[500]}} aria-hidden="true"></div>
            <span>Temps réel</span>
          </div>
        </div>
      </header>

      {/* Statistiques globales */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" role="region" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Statistiques globales des utilisateurs</h2>
        <article className="rounded-xl border p-3 sm:p-4" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm" style={{color: tokens.colors.gray[600]}}>Total Utilisateurs</span>
            <Users size={14} className="sm:size-16" style={{color: tokens.colors.primary[600]}} aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.gray[900]}}>{totalUsers}</div>
          <div className="text-xs mt-1" style={{color: tokens.colors.gray[500]}}>{globalStats.activeUsers} actifs (30j)</div>
        </article>

        <article className="rounded-xl border p-3 sm:p-4" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm" style={{color: tokens.colors.gray[600]}}>Plans Pro</span>
            <CheckCircle size={14} className="sm:size-16" style={{color: tokens.colors.success[600]}} aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.success[600]}}>{proUsers}</div>
          <div className="text-xs mt-1" style={{color: tokens.colors.gray[500]}}>{totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : '0'}% des utilisateurs</div>
        </article>

        <article className="rounded-xl border p-3 sm:p-4" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm" style={{color: tokens.colors.gray[600]}}>Plans Free</span>
            <Users size={14} className="sm:size-16" style={{color: tokens.colors.gray[600]}} aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.gray[900]}}>{freeUsers}</div>
          <div className="text-xs mt-1" style={{color: tokens.colors.gray[500]}}>{totalUsers > 0 ? ((freeUsers / totalUsers) * 100).toFixed(1) : '0'}% des utilisateurs</div>
        </article>

        <article className="rounded-xl border p-3 sm:p-4" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="article">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm" style={{color: tokens.colors.gray[600]}}>En attente</span>
            <Clock size={14} className="sm:size-16" style={{color: tokens.colors.warning[600]}} aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-2xl font-bold" style={{color: tokens.colors.warning[600]}}>{pendingCount}</div>
          <div className="text-xs mt-1" style={{color: tokens.colors.gray[500]}}>Validations requises</div>
        </article>
      </section>

      {/* Filtres et recherche */}
      <section className="rounded-xl border p-3 sm:p-4" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="search" aria-label="Filtres de recherche des utilisateurs">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="sm:size-20 absolute left-3 top-1/2 transform -translate-y-1/2" style={{color: tokens.colors.gray[400]}} aria-hidden="true" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 rounded-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                border: `2px solid ${tokens.colors.gray[200]}`,
                color: tokens.colors.gray[900]
              }}
              aria-label="Rechercher un utilisateur par nom ou email"
              role="searchbox"
              tabIndex={0}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                border: `2px solid ${tokens.colors.gray[200]}`,
                color: tokens.colors.gray[900]
              }}
              aria-label="Filtrer par type de plan"
              tabIndex={0}
            >
              <option value="">Tous les plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                border: `2px solid ${tokens.colors.gray[200]}`,
                color: tokens.colors.gray[900]
              }}
              aria-label="Filtrer par statut d'activité"
              tabIndex={0}
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            <button 
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{
                backgroundColor: tokens.colors.primary[600],
                color: tokens.colors.gray[50]
              }}
              onClick={handleFilter}
              aria-label="Appliquer les filtres"
              role="button"
              tabIndex={0}
            >
              <Filter size={14} className="sm:size-16" aria-hidden="true" />
              <span className="hidden sm:inline">Filtrer</span>
              <span className="sm:hidden">OK</span>
            </button>
          </div>
        </div>
      </section>

      {/* Liste des utilisateurs */}
      <section className="rounded-xl border overflow-hidden" style={{backgroundColor: tokens.colors.gray[50], borderColor: tokens.colors.gray[200]}} role="region" aria-labelledby="users-list-heading">
        <header className="px-4 sm:px-6 py-3 sm:py-4 border-b" style={{backgroundColor: tokens.colors.gray[100], borderColor: tokens.colors.gray[200]}}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 id="users-list-heading" className="font-semibold" style={{color: tokens.colors.gray[900]}}>Liste des utilisateurs</h2>
            <span className="text-xs sm:text-sm" style={{color: tokens.colors.gray[500]}}>{profiles?.length || 0} utilisateurs</span>
          </div>
        </header>

        <div className="divide-y" style={{borderColor: tokens.colors.gray[200]}}>
          <UsersListClient 
            profiles={profiles || []}
            invoices={invoices || []}
            clients={clients || []}
          />
        </div>
      </section>
    </div>
  )
}
