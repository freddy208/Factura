'use client'

import { useState } from 'react'
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Database, 
  Users, 
  Calendar, 
  Filter, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Eye,
  Trash2,
  Share2,
  Settings
} from 'lucide-react'

interface ExportConfig {
  type: 'users' | 'invoices' | 'clients' | 'analytics' | 'logs'
  format: 'csv' | 'excel' | 'json' | 'pdf'
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  filters?: Record<string, any>
  columns?: string[]
}

interface ExportHistory {
  id: string
  type: string
  format: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
  file_size?: number
  download_url?: string
  created_by: string
}

interface DataExportManagerProps {
  onExport: (config: ExportConfig) => Promise<string>
  exportHistory: ExportHistory[]
  onDownload: (exportId: string) => void
  onDelete: (exportId: string) => void
}

export function DataExportManager({ onExport, exportHistory, onDownload, onDelete }: DataExportManagerProps) {
  const [config, setConfig] = useState<ExportConfig>({
    type: 'users',
    format: 'csv',
    dateRange: 'month'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'export' | 'history'>('export')

  // Generate unique IDs for accessibility
  const searchInputId = 'export-search'
  const errorId = 'export-error'
  const successId = 'export-success'

  const exportTypes = [
    { value: 'users', label: 'Utilisateurs', icon: Users, description: 'Liste complète des utilisateurs' },
    { value: 'invoices', label: 'Factures', icon: FileText, description: 'Toutes les factures et devis' },
    { value: 'clients', label: 'Clients', icon: Database, description: 'Base de données clients' },
    { value: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Statistiques et métriques' },
    { value: 'logs', label: 'Logs', icon: Settings, description: "Journaux d'activité" }
  ]

  const formats = [
    { value: 'csv', label: 'CSV', description: 'Format CSV universel' },
    { value: 'excel', label: 'Excel', description: 'Fichier Excel (.xlsx)' },
    { value: 'json', label: 'JSON', description: 'Format JSON structuré' },
    { value: 'pdf', label: 'PDF', description: 'Rapport PDF formaté' }
  ]

  const dateRanges = [
    { value: 'today', label: "Aujourd'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
    { value: 'custom', label: 'Personnalisé' }
  ]

  const handleExport = async () => {
    setLoading(true)
    try {
      await onExport(config)
      setActiveTab('history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'processing': return RefreshCw
      case 'failed': return AlertTriangle
      case 'pending': return Clock
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-amber-600 bg-amber-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('export')}
            aria-label="Ouvrir l'onglet de création d'export"
            aria-selected={activeTab === 'export'}
            role="tab"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'export' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Download size={16} aria-hidden="true" />
            <span className="text-sm font-medium">Nouvel export</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            aria-label="Ouvrir l'onglet d'historique des exports"
            aria-selected={activeTab === 'history'}
            role="tab"
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'history' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock size={16} aria-hidden="true" />
            <span className="text-sm font-medium">Historique</span>
          </button>
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

      {activeTab === 'export' ? (
        <div className="space-y-6">
          {/* Type de données */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Type de données à exporter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exportTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => setConfig({ ...config, type: type.value as any })}
                    aria-label={`Sélectionner le type d'export: ${type.label}`}
                    aria-pressed={config.type === type.value}
                    role="button"
                    className={`p-4 rounded-xl border-2 transition-all ${
                      config.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        config.type === type.value ? 'bg-blue-600' : 'bg-slate-100'
                      }`}>
                        <Icon size={20} className={config.type === type.value ? 'text-white' : 'text-slate-600'} />
                      </div>
                      <span className={`font-medium ${
                        config.type === type.value ? 'text-blue-900' : 'text-slate-900'
                      }`}>
                        {type.label}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      config.type === type.value ? 'text-blue-700' : 'text-slate-500'
                    }`}>
                      {type.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Format et plage de dates */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Format d'export</h3>
              <div className="space-y-3">
                {formats.map((format) => (
                  <label
                    key={format.value}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format.value}
                      checked={config.format === format.value}
                      onChange={(e) => setConfig({ ...config, format: e.target.value as any })}
                      className="text-blue-600"
                      aria-describedby={`format-desc-${format.value}`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{format.label}</p>
                      <p id={`format-desc-${format.value}`} className="text-sm text-slate-500">{format.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Plage de dates</h3>
              <div className="space-y-3">
                {dateRanges.map((range) => (
                  <label
                    key={range.value}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="dateRange"
                      value={range.value}
                      checked={config.dateRange === range.value}
                      onChange={(e) => setConfig({ ...config, dateRange: e.target.value as any })}
                      className="text-blue-600"
                    />
                    <span className="font-medium text-slate-900">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Filtres avancés */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Filtres avancés</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Colonnes à inclure
                </label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Toutes les colonnes</option>
                  <option>Colonnes essentielles</option>
                  <option>Personnalisé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filtrer par statut
                </label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Tous les statuts</option>
                  <option>Actif uniquement</option>
                  <option>Inactif uniquement</option>
                </select>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="flex justify-end gap-3">
            <button 
              onClick={() => {
                setConfig({ type: 'users', format: 'csv', dateRange: 'month' })
                setError(null)
                setSuccess(null)
              }}
              aria-label="Réinitialiser les paramètres d'export"
              className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={async () => {
                setLoading(true)
                setError(null)
                try {
                  await handleExport()
                  setSuccess('Export lancé avec succès!')
                } catch (err) {
                  setError('Erreur lors du lancement de l\'export. Veuillez réessayer.')
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              aria-label="Lancer l'export"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Download size={16} aria-hidden="true" />
              )}
              <span className="font-medium">
                {loading ? 'Export en cours...' : 'Lancer l\'export'}
              </span>
            </button>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Historique des exports */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Historique des exports</h3>
                <span className="text-sm text-slate-500">{exportHistory.length} exports</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {exportHistory.map((exportItem) => {
                const StatusIcon = getStatusIcon(exportItem.status)
                return (
                  <div key={exportItem.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Info export */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          exportItem.status === 'completed' ? 'bg-green-100' :
                          exportItem.status === 'processing' ? 'bg-blue-100' :
                          exportItem.status === 'failed' ? 'bg-red-100' : 'bg-amber-100'
                        }`}>
                          {exportItem.status === 'processing' ? (
                            <RefreshCw size={20} className="text-blue-600 animate-spin" />
                          ) : (
                            <StatusIcon size={20} className={
                              exportItem.status === 'completed' ? 'text-green-600' :
                              exportItem.status === 'failed' ? 'text-red-600' : 'text-amber-600'
                            } />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 capitalize">
                            {exportItem.type} ({exportItem.format.toUpperCase()})
                          </p>
                          <p className="text-sm text-slate-500">
                            Créé par {exportItem.created_by} • {formatDate(exportItem.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Statut et taille */}
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(exportItem.status)}`}>
                          {exportItem.status === 'completed' ? 'Terminé' :
                           exportItem.status === 'processing' ? 'En cours' :
                           exportItem.status === 'failed' ? 'Échoué' : 'En attente'}
                        </span>
                        {exportItem.file_size && (
                          <span className="text-sm text-slate-600">
                            {formatFileSize(exportItem.file_size)}
                          </span>
                        )}
                        {exportItem.completed_at && (
                          <span className="text-sm text-slate-500">
                            {formatDate(exportItem.completed_at)}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {exportItem.status === 'completed' && exportItem.download_url && (
                          <button
                            onClick={() => {
                              try {
                                onDownload(exportItem.id)
                                setSuccess(`Téléchargement de ${exportItem.type} lancé`)
                              } catch (err) {
                                setError('Erreur lors du téléchargement')
                              }
                            }}
                            aria-label={`Télécharger l'export ${exportItem.type} au format ${exportItem.format}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Download size={14} aria-hidden="true" />
                            <span className="text-sm font-medium">Télécharger</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            try {
                              onDelete(exportItem.id)
                              setSuccess('Export supprimé avec succès')
                            } catch (err) {
                              setError('Erreur lors de la suppression')
                            }
                          }}
                          aria-label={`Supprimer l'export ${exportItem.id}`}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Statistiques d'export */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Exports ce mois</span>
                <TrendingUp size={16} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {exportHistory.filter(e => new Date(e.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-xs text-slate-500 mt-1">30 derniers jours</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Taille totale</span>
                <Database size={16} className="text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatFileSize(exportHistory.filter(e => e.file_size).reduce((sum, e) => sum + (e.file_size || 0), 0))}
              </div>
              <div className="text-xs text-slate-500 mt-1">tous les exports</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Taux de succès</span>
                <CheckCircle size={16} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {exportHistory.length > 0 
                  ? ((exportHistory.filter(e => e.status === 'completed').length / exportHistory.length) * 100).toFixed(0)
                  : 0}%
              </div>
              <div className="text-xs text-slate-500 mt-1">exports réussis</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Format populaire</span>
                <FileSpreadsheet size={16} className="text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">CSV</div>
              <div className="text-xs text-slate-500 mt-1">plus utilisé</div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
