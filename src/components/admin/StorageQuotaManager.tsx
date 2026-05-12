'use client'

import { useState, useMemo, useCallback } from 'react'
import { 
  HardDrive, 
  Upload, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Settings, 
  RefreshCw,
  FileText,
  Image,
  Archive,
  MoreHorizontal,
  Search,
  Filter
} from 'lucide-react'

interface StorageQuota {
  user_id: string
  user_email: string
  company_name: string | null
  plan: 'free' | 'pro'
  used_bytes: number
  limit_bytes: number
  file_count: number
  last_updated: string
}

interface StorageQuotaManagerProps {
  quotas: StorageQuota[]
  onUpdateQuota: (userId: string, newLimit: number) => void
  onRefresh: () => void
}

export function StorageQuotaManager({ quotas, onUpdateQuota, onRefresh }: StorageQuotaManagerProps) {
  const [selectedUser, setSelectedUser] = useState<StorageQuota | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'pro'>('all')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Generate unique IDs for accessibility
  const searchInputId = 'quota-search'
  const filterSelectId = 'quota-filter'
  const errorId = 'quota-error'
  const successId = 'quota-success'

  // Memoized filtered quotas for performance
  const filteredQuotas = useMemo(() => {
    return quotas.filter(quota => {
      const matchesSearch = 
        quota.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quota.company_name && quota.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesPlan = filterPlan === 'all' || quota.plan === filterPlan
      
      return matchesSearch && matchesPlan
    })
  }, [quotas, searchTerm, filterPlan])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage > 90) return 'text-red-600 bg-red-100'
    if (percentage > 70) return 'text-amber-600 bg-amber-100'
    return 'text-green-600 bg-green-100'
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) return Image
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) return FileText
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) return Archive
    return FileText
  }

  // Memoized callback for updating quota
  const handleUpdateQuota = useCallback(async (userId: string, newLimit: number) => {
    setLoading(userId)
    try {
      await onUpdateQuota(userId, newLimit)
      setSuccess(`Quota mis à jour avec succès`)
      setError(null)
    } catch (err) {
      setError('Erreur lors de la mise à jour du quota')
      setSuccess(null)
    } finally {
      setLoading(null)
    }
  }, [onUpdateQuota])

  // Memoized statistics calculations
  const statistics = useMemo(() => {
    const totalUsed = quotas.reduce((sum, quota) => sum + quota.used_bytes, 0)
    const totalLimit = quotas.reduce((sum, quota) => sum + quota.limit_bytes, 0)
    const totalUsers = quotas.length
    const alertCount = quotas.filter(q => getUsagePercentage(q.used_bytes, q.limit_bytes) > 80).length
    
    return { totalUsed, totalLimit, totalUsers, alertCount }
  }, [quotas])

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Stockage total utilisé</span>
            <HardDrive size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatBytes(statistics.totalUsed)}</div>
          <div className="text-xs text-slate-500 mt-1">sur {formatBytes(statistics.totalLimit)}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Utilisateurs actifs</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{statistics.totalUsers}</div>
          <div className="text-xs text-slate-500 mt-1">comptes avec stockage</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Moyenne par utilisateur</span>
            <TrendingUp size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatBytes(statistics.totalUsed / statistics.totalUsers)}</div>
          <div className="text-xs text-slate-500 mt-1">utilisation moyenne</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Alertes stockage</span>
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {statistics.alertCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">utilisateurs &gt; 80%</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Rechercher un utilisateur par email ou nom d'entreprise"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <label htmlFor={filterSelectId} className="sr-only">Filtrer par plan</label>
            <select
              id={filterSelectId}
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value as any)}
              aria-label="Filtrer par type d'abonnement"
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
            <button
              onClick={onRefresh}
              disabled={loading === 'refresh'}
              aria-label="Actualiser la liste des quotas"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={loading === 'refresh' ? 'animate-spin' : ''} aria-hidden="true" />
              <span className="text-sm font-medium">Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages de feedback */}
      {error && (
        <div 
          id={errorId}
          role="alert" 
          aria-live="polite"
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" aria-hidden="true" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div 
          id={successId}
          role="status" 
          aria-live="polite"
          className="p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" aria-hidden="true" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Liste des quotas */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Quotas de stockage</h2>
            <span className="text-sm text-slate-500">{filteredQuotas.length} utilisateurs</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredQuotas.map((quota) => {
            const usagePercentage = getUsagePercentage(quota.used_bytes, quota.limit_bytes)
            const isNearLimit = usagePercentage > 80
            const isOverLimit = usagePercentage >= 100
            
            return (
              <div key={quota.user_id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Info utilisateur */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-slate-600 font-bold text-sm">
                        {(quota.company_name || quota.user_email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {quota.company_name || 'Sans entreprise'}
                      </p>
                      <p className="text-sm text-slate-500">{quota.user_email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          quota.plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {quota.plan === 'pro' ? 'Pro' : 'Free'}
                        </span>
                        {isNearLimit && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                            {isOverLimit ? 'Limite dépassée' : 'Presque plein'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stockage */}
                  <div className="flex-1 lg:max-w-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Stockage utilisé</span>
                      <span className="text-sm font-medium text-slate-900">
                        {formatBytes(quota.used_bytes)} / {formatBytes(quota.limit_bytes)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOverLimit ? 'bg-red-500' :
                          isNearLimit ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{usagePercentage.toFixed(1)}% utilisé</span>
                      <span className="text-xs text-slate-500">{quota.file_count} fichiers</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUser(quota)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Gérer le stockage"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Voir les fichiers"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal de gestion de quota */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Gérer le quota de stockage</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Utilisateur</p>
                <p className="font-medium text-slate-900">
                  {selectedUser.company_name || selectedUser.user_email}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Utilisation actuelle</p>
                <p className="font-medium text-slate-900">
                  {formatBytes(selectedUser.used_bytes)} / {formatBytes(selectedUser.limit_bytes)}
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-full rounded-full ${
                      getUsagePercentage(selectedUser.used_bytes, selectedUser.limit_bytes) > 80 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(getUsagePercentage(selectedUser.used_bytes, selectedUser.limit_bytes), 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quota-input" className="block text-sm font-medium text-slate-700 mb-2">
                  Nouvelle limite (MB)
                </label>
                <input
                  id="quota-input"
                  type="number"
                  defaultValue={selectedUser.limit_bytes / 1024 / 1024}
                  aria-label="Nouvelle limite de stockage en mégabytes"
                  aria-describedby={error ? errorId : undefined}
                  aria-invalid={!!error}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    const input = document.querySelector('#quota-input') as HTMLInputElement
                    const newLimitMB = parseInt(input.value)
                    if (isNaN(newLimitMB) || newLimitMB < 1) {
                      setError('Veuillez entrer une valeur valide supérieure à 0')
                      return
                    }
                    handleUpdateQuota(selectedUser.user_id, newLimitMB * 1024 * 1024)
                    setSelectedUser(null)
                    setSuccess(`Quota mis à jour pour ${selectedUser.company_name || selectedUser.user_email}`)
                  }}
                  disabled={loading === selectedUser.user_id}
                  aria-label="Mettre à jour le quota de stockage"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading === selectedUser.user_id ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  <span className="font-medium">Mettre à jour</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setError(null)
                    setSuccess(null)
                  }}
                  aria-label="Annuler et fermer le modal"
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
