'use client'

import { useState, useMemo, useCallback } from 'react'
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Download, 
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  User,
  Mail,
  CreditCard,
  Database,
  Zap,
  Lock,
  Unlock,
  Ban,
  Power,
  TrendingUp,
  BarChart3,
  Trash2
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  category: 'user' | 'system' | 'security' | 'billing' | 'api' | 'admin'
  action: string
  description: string
  user_id?: string
  user_email?: string
  user_name?: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
}

interface ActivityLogsViewerProps {
  logs: LogEntry[]
  onLoadMore: (offset: number, limit: number) => Promise<void>
  onExport: (filters: any) => Promise<void>
  totalLogs: number
  loading?: boolean
}

export function ActivityLogsViewer({ logs, onLoadMore, onExport, totalLogs, loading = false }: ActivityLogsViewerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('24h')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Generate unique IDs for accessibility
  const searchInputId = 'logs-search'
  const levelSelectId = 'logs-level'
  const categorySelectId = 'logs-category'
  const dateRangeSelectId = 'logs-date-range'
  const errorId = 'logs-error'
  const successId = 'logs-success'

  // Memoized filtered logs for performance
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel
      const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory
      
      return matchesSearch && matchesLevel && matchesCategory
    })
  }, [logs, searchTerm, selectedLevel, selectedCategory])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return CheckCircle
      case 'warning': return AlertTriangle
      case 'error': return AlertTriangle
      case 'info': return Activity
      default: return Activity
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-amber-600 bg-amber-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'info': return 'text-blue-600 bg-blue-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user': return Users
      case 'system': return Settings
      case 'security': return Shield
      case 'billing': return CreditCard
      case 'api': return Zap
      case 'admin': return Lock
      default: return Activity
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user': return 'text-blue-600 bg-blue-50'
      case 'system': return 'text-purple-600 bg-purple-50'
      case 'security': return 'text-red-600 bg-red-50'
      case 'billing': return 'text-green-600 bg-green-50'
      case 'api': return 'text-amber-600 bg-amber-50'
      case 'admin': return 'text-slate-600 bg-slate-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('login') || action.includes('connexion')) return Unlock
    if (action.includes('logout') || action.includes('déconnexion')) return Lock
    if (action.includes('suspend') || action.includes('ban')) return Ban
    if (action.includes('activate') || action.includes('reactivate')) return Power
    if (action.includes('create') || action.includes('créé')) return Users
    if (action.includes('update') || action.includes('modifié')) return Settings
    if (action.includes('delete') || action.includes('supprimé')) return Trash2
    if (action.includes('export') || action.includes('exporté')) return Download
    if (action.includes('payment') || action.includes('paiement')) return CreditCard
    if (action.includes('invoice') || action.includes('facture')) return FileText
    if (action.includes('email') || action.includes('mail')) return Mail
    if (action.includes('api') || action.includes('request')) return Zap
    return Activity
  }

  // Memoized statistics calculations
  const statistics = useMemo(() => {
    const errorCount = logs.filter(l => l.level === 'error').length
    const securityAlertsCount = logs.filter(l => l.category === 'security' && l.level !== 'info').length
    const adminActionsCount = logs.filter(l => l.category === 'admin').length
    
    return { errorCount, securityAlertsCount, adminActionsCount }
  }, [logs])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return formatDate(timestamp)
  }

  // Memoized callback for toggling log expansion
  const toggleLogExpansion = useCallback((logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }, [expandedLogs])

  const levels = [
    { value: 'all', label: 'Tous les niveaux' },
    { value: 'info', label: 'Info' },
    { value: 'success', label: 'Succès' },
    { value: 'warning', label: 'Avertissement' },
    { value: 'error', label: 'Erreur' }
  ]

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'user', label: 'Utilisateur' },
    { value: 'system', label: 'Système' },
    { value: 'security', label: 'Sécurité' },
    { value: 'billing', label: 'Facturation' },
    { value: 'api', label: 'API' },
    { value: 'admin', label: 'Admin' }
  ]

  const dateRanges = [
    { value: '1h', label: 'Dernière heure' },
    { value: '24h', label: '24 dernières heures' },
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' }
  ]

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Total des logs</span>
            <Activity size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalLogs.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">toutes périodes</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Erreurs</span>
            <AlertTriangle size={16} className="text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {statistics.errorCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">24 dernières heures</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Alertes sécurité</span>
            <Shield size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {statistics.securityAlertsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">nécessite attention</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Actions admin</span>
            <Lock size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {statistics.adminActionsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">activités admin</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Filtres</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Filter size={16} />
            {showFilters ? 'Masquer' : 'Afficher'} les filtres
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Rechercher dans les logs par action, description ou email utilisateur"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {showFilters && (
            <>
              <label htmlFor={levelSelectId} className="sr-only">Filtrer par niveau</label>
              <select
                id={levelSelectId}
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                aria-label="Filtrer les logs par niveau de sévérité"
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>

              <label htmlFor={categorySelectId} className="sr-only">Filtrer par catégorie</label>
              <select
                id={categorySelectId}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filtrer les logs par catégorie"
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>

              <label htmlFor={dateRangeSelectId} className="sr-only">Filtrer par plage de dates</label>
              <select
                id={dateRangeSelectId}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                aria-label="Filtrer les logs par plage de dates"
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                try {
                  onExport({ searchTerm, level: selectedLevel, category: selectedCategory, dateRange })
                  setSuccess('Export des logs lancé avec succès')
                } catch (err) {
                  setError('Erreur lors du lancement de l\'export')
                }
              }}
              disabled={loading}
              aria-label="Exporter les logs filtrés"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} aria-hidden="true" />
              <span className="text-sm font-medium">Exporter</span>
            </button>
            <button 
              disabled={loading}
              aria-label="Actualiser la liste des logs"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
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

      {/* Liste des logs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Journal d'activité</h3>
            <span className="text-sm text-slate-500">{filteredLogs.length} entrées</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => {
            const LevelIcon = getLevelIcon(log.level)
            const CategoryIcon = getCategoryIcon(log.category)
            const ActionIcon = getActionIcon(log.action)
            const isExpanded = expandedLogs.has(log.id)

            return (
              <div key={log.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Icônes et niveau */}
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getLevelColor(log.level)}`}>
                      <LevelIcon size={16} />
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(log.category)}`}>
                      <CategoryIcon size={16} />
                    </div>
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <ActionIcon size={16} className="text-slate-600" />
                    </div>
                  </div>

                  {/* Contenu principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-2">
                      <h4 className="font-medium text-slate-900 truncate">{log.action}</h4>
                      <p className="text-sm text-slate-600 truncate">{log.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatRelativeTime(log.timestamp)}
                      </span>
                      {log.user_email && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {log.user_email}
                        </span>
                      )}
                      {log.ip_address && (
                        <span className="flex items-center gap-1">
                          <Shield size={12} />
                          {log.ip_address}
                        </span>
                      )}
                    </div>

                    {/* Métadonnées étendues */}
                    {isExpanded && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Timestamp:</span>
                            <span className="ml-2 text-slate-600">{formatDate(log.timestamp)}</span>
                          </div>
                          {log.user_agent && (
                            <div>
                              <span className="font-medium text-slate-700">User Agent:</span>
                              <span className="ml-2 text-slate-600 truncate">{log.user_agent}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-slate-700">Niveau:</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                              {log.level.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Catégorie:</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                              {log.category.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div>
                            <span className="font-medium text-slate-700 text-sm">Métadonnées:</span>
                            <pre className="mt-2 p-3 bg-slate-100 rounded text-xs text-slate-700 overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLogExpansion(log.id)}
                      aria-label={isExpanded ? 'Réduire les détails du log' : 'Développer les détails du log'}
                      aria-expanded={isExpanded}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button 
                      aria-label="Plus d'options pour ce log"
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Chargement supplémentaire */}
        {filteredLogs.length < totalLogs && (
          <div className="p-4 text-center">
            <button
              onClick={() => {
                try {
                  onLoadMore(filteredLogs.length, 50)
                  setSuccess('Logs supplémentaires chargés')
                } catch (err) {
                  setError('Erreur lors du chargement des logs')
                }
              }}
              disabled={loading}
              aria-label="Charger plus de logs"
              className="flex items-center justify-center gap-2 mx-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Download size={16} aria-hidden="true" />
              )}
              <span className="font-medium">
                {loading ? 'Chargement...' : 'Charger plus de logs'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ChevronUp component manquant
const ChevronUp = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
