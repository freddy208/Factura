'use client'

import { useState } from 'react'
import { tokens } from '@/lib/design-system'
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Database, 
  Wifi, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  FileText, 
  BarChart3, 
  Zap,
  Server,
  MemoryStick,
  Network,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react'

interface AdminPerformancePageClientProps {
  profiles: any[]
  invoices: any[]
  clients: any[]
  systemMetrics: any
  activeUsers24h: number
  activeUsers7d: number
  activeUsers30d: number
  invoices24h: number
  invoices7d: number
  invoices30d: number
  avgResponseTime: number
  errorRate: number
  throughput: number
  hourlyData: any[]
  dailyData: any[]
}

export function AdminPerformancePageClient({
  profiles,
  invoices,
  clients,
  systemMetrics,
  activeUsers24h,
  activeUsers7d,
  activeUsers30d,
  invoices24h,
  invoices7d,
  invoices30d,
  avgResponseTime,
  errorRate,
  throughput,
  hourlyData,
  dailyData
}: AdminPerformancePageClientProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simuler un rafraîchissement
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleExport = () => {
    // Fonctionnalité d'export
    console.log('Exporting performance data...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header role="banner" className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{color: tokens.colors.gray[900]}}>Performance Système</h1>
          <p className="mt-1" style={{color: tokens.colors.gray[600]}}>Monitoring et métriques de la plateforme FACTURA</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-gray-50"
            style={{
              backgroundColor: 'white',
              borderColor: tokens.colors.gray[200],
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Actualiser les métriques système"
            role="button"
            tabIndex={0}
          >
            <RefreshCw 
              size={16} 
              style={{color: tokens.colors.gray[600]}}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            <span className="text-sm font-medium">
              {isRefreshing ? 'Actualisation...' : 'Actualiser'}
            </span>
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-80"
            style={{
              backgroundColor: tokens.colors.primary[600]
            }}
            onClick={handleExport}
            aria-label="Exporter les données de performance"
            role="button"
            tabIndex={0}
          >
            <Download size={16} />
            <span className="text-sm font-medium">Exporter</span>
          </button>
          <div className="flex items-center gap-2 text-xs" style={{color: tokens.colors.gray[500]}}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: tokens.colors.success[500]}} aria-hidden="true"></div>
            <span role="status" aria-live="polite">Temps réel</span>
          </div>
        </div>
      </header>

      {/* Métriques système */}
      <section role="region" aria-labelledby="system-metrics-heading" className="space-y-4">
        <h2 id="system-metrics-heading" className="text-xl font-bold" style={{color: tokens.colors.gray[900]}}>Métriques Système</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* CPU */}
          <div className="p-4" style={{
            backgroundColor: 'white',
            borderRadius: tokens.borderRadius.xl,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: tokens.colors.gray[200]
          }} role="article" aria-labelledby="cpu-metric-title">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu size={20} style={{color: tokens.colors.primary[600]}} />
                <span id="cpu-metric-title" className="font-medium" style={{color: tokens.colors.gray[900]}}>CPU</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                systemMetrics.cpu.status === 'normal' ? '' : ''
              }`} style={{
                backgroundColor: systemMetrics.cpu.status === 'normal' ? tokens.colors.success[100] : tokens.colors.error[100],
                color: systemMetrics.cpu.status === 'normal' ? tokens.colors.success[700] : tokens.colors.error[700]
              }}>
                {systemMetrics.cpu.status === 'normal' ? 'Normal' : 'Alerte'}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{color: tokens.colors.gray[600]}}>Utilisation</span>
                  <span className="font-medium">{systemMetrics.cpu.usage}%</span>
                </div>
                <div 
                  className="w-full h-2 overflow-hidden rounded-full"
                  role="progressbar"
                  aria-valuenow={systemMetrics.cpu.usage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Utilisation CPU: ${systemMetrics.cpu.usage}%`}
                  style={{backgroundColor: tokens.colors.gray[100]}}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${systemMetrics.cpu.usage}%`,
                      backgroundColor: systemMetrics.cpu.usage > 80 ? tokens.colors.error[500] : 
                                     systemMetrics.cpu.usage > 60 ? tokens.colors.warning[500] : tokens.colors.success[500]
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs" style={{color: tokens.colors.gray[500]}}>
                <span>{systemMetrics.cpu.cores} cœurs</span>
                <span>{systemMetrics.cpu.temperature}°C</span>
              </div>
            </div>
          </div>

          {/* Mémoire */}
          <div className="p-4" role="article" aria-labelledby="memory-metric-title" style={{
            backgroundColor: 'white',
            borderRadius: tokens.borderRadius.xl,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: tokens.colors.gray[200]
          }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MemoryStick size={20} style={{color: tokens.colors.success[600]}} />
                <span id="memory-metric-title" className="font-medium" style={{color: tokens.colors.gray[900]}}>Mémoire</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                backgroundColor: systemMetrics.memory.status === 'normal' ? tokens.colors.success[100] : tokens.colors.error[100],
                color: systemMetrics.memory.status === 'normal' ? tokens.colors.success[700] : tokens.colors.error[700]
              }}>
                {systemMetrics.memory.status === 'normal' ? 'Normal' : 'Alerte'}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{color: tokens.colors.gray[600]}}>Utilisation</span>
                  <span className="font-medium">{systemMetrics.memory.percentage}%</span>
                </div>
                <div 
                  style={{backgroundColor: tokens.colors.gray[100]}}
                  role="progressbar"
                  aria-valuenow={systemMetrics.memory.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Utilisation Mémoire: ${systemMetrics.memory.percentage}%`}
                >
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      systemMetrics.memory.percentage > 80 ? 'bg-red-500' : 
                      systemMetrics.memory.percentage > 60 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${systemMetrics.memory.percentage}%` }}
                  />
                </div>
              </div>
              <div style={{color: tokens.colors.gray[500]}}>
                <span>{(systemMetrics.memory.used / 1024).toFixed(1)}GB utilisés</span>
                <span>{(systemMetrics.memory.total / 1024).toFixed(1)}GB total</span>
              </div>
            </div>
          </div>

          {/* Disque */}
          <div className="p-4" role="article" aria-labelledby="disk-metric-title" style={{
            backgroundColor: 'white',
            borderRadius: tokens.borderRadius.xl,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: tokens.colors.gray[200]
          }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HardDrive size={20} style={{color: tokens.colors.secondary[600]}} />
                <span id="disk-metric-title" className="font-medium" style={{color: tokens.colors.gray[900]}}>Disque</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                backgroundColor: systemMetrics.disk.status === 'normal' ? tokens.colors.success[100] : tokens.colors.error[100],
                color: systemMetrics.disk.status === 'normal' ? tokens.colors.success[700] : tokens.colors.error[700]
              }}>
                {systemMetrics.disk.status === 'normal' ? 'Normal' : 'Alerte'}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{color: tokens.colors.gray[600]}}>Utilisation</span>
                  <span className="font-medium">{systemMetrics.disk.percentage}%</span>
                </div>
                <div 
                  style={{backgroundColor: tokens.colors.gray[100]}}
                  role="progressbar"
                  aria-valuenow={systemMetrics.disk.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Utilisation Disque: ${systemMetrics.disk.percentage}%`}
                >
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      systemMetrics.disk.percentage > 80 ? 'bg-red-500' : 
                      systemMetrics.disk.percentage > 60 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${systemMetrics.disk.percentage}%` }}
                  />
                </div>
              </div>
              <div style={{color: tokens.colors.gray[500]}}>
                <span>{(systemMetrics.disk.used / 1024).toFixed(1)}GB utilisés</span>
                <span>{(systemMetrics.disk.total / 1024).toFixed(1)}GB total</span>
              </div>
            </div>
          </div>

          {/* Base de données */}
          <div className="p-4" role="article" aria-labelledby="database-metric-title" style={{
            backgroundColor: 'white',
            borderRadius: tokens.borderRadius.xl,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: tokens.colors.gray[200]
          }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database size={20} style={{color: tokens.colors.warning[600]}} />
                <span id="database-metric-title" className="font-medium" style={{color: tokens.colors.gray[900]}}>Base de données</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                systemMetrics.database.status === 'normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {systemMetrics.database.status === 'normal' ? 'Normal' : 'Alerte'}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{color: tokens.colors.gray[600]}}>Connexions</span>
                  <span className="font-medium">{systemMetrics.database.connections}/{systemMetrics.database.maxConnections}</span>
                </div>
                <div 
                  style={{backgroundColor: tokens.colors.gray[100]}}
                  role="progressbar"
                  aria-valuenow={systemMetrics.database.connections}
                  aria-valuemin={0}
                  aria-valuemax={systemMetrics.database.maxConnections}
                  aria-label={`Connexions base de données: ${systemMetrics.database.connections}/${systemMetrics.database.maxConnections}`}
                >
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      systemMetrics.database.connections > 80 ? 'bg-red-500' : 
                      systemMetrics.database.connections > 60 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(systemMetrics.database.connections / systemMetrics.database.maxConnections) * 100}%` }}
                  />
                </div>
              </div>
              <div style={{color: tokens.colors.gray[500]}}>
                <span>Temps requête</span>
                <span>{systemMetrics.database.queryTime}ms</span>
              </div>
            </div>
          </div>

          {/* Réseau */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: tokens.borderRadius.xl,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: tokens.colors.gray[200]
          }} role="article" aria-labelledby="network-metric-title">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Network size={20} className="text-indigo-600" />
                <span id="network-metric-title" style={{color: tokens.colors.gray[900]}}>Réseau</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                systemMetrics.network.status === 'normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {systemMetrics.network.status === 'normal' ? 'Normal' : 'Alerte'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{color: tokens.colors.gray[600]}}>Bande passante</span>
                <span className="font-medium">{systemMetrics.network.bandwidth} Mbps</span>
              </div>
              <div style={{color: tokens.colors.gray[500]}}>
                <span>Latence: {systemMetrics.network.latency}ms</span>
                <span>Uptime: {systemMetrics.network.uptime}%</span>
              </div>
            </div>
          </div>

          {/* Performance API */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: tokens.borderRadius.xl,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: tokens.colors.gray[200]
          }} role="article" aria-labelledby="api-metric-title">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-orange-600" />
                <span id="api-metric-title" style={{color: tokens.colors.gray[900]}}>Performance API</span>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                Normal
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{color: tokens.colors.gray[600]}}>Temps réponse</span>
                <span className="font-medium">{avgResponseTime}ms</span>
              </div>
              <div style={{color: tokens.colors.gray[500]}}>
                <span>Taux erreur: {errorRate}%</span>
                <span>Débit: {throughput} req/min</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Métriques d'utilisation */}
      <section role="region" aria-labelledby="usage-metrics-heading" className="space-y-4">
        <h2 id="usage-metrics-heading" style={{color: tokens.colors.gray[900]}} className="text-xl font-bold">Métriques d'Utilisation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div style={{
            backgroundColor: 'white',
            borderRadius: tokens.borderRadius.xl,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: tokens.colors.gray[200]
          }} role="article" aria-labelledby="active-users-title">
            <div className="flex items-center justify-between mb-2">
              <span id="active-users-title" style={{color: tokens.colors.gray[600]}} className="text-sm">Utilisateurs actifs (24h)</span>
              <Users size={16} className="text-blue-600" aria-hidden="true" />
            </div>
            <div style={{color: tokens.colors.gray[900]}} className="text-2xl font-bold">{activeUsers24h}</div>
            <div style={{color: tokens.colors.gray[500]}} className="text-xs mt-1">{activeUsers7d} sur 7 jours</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: tokens.borderRadius.xl,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: tokens.colors.gray[200]
          }} role="article" aria-labelledby="invoices-title">
            <div className="flex items-center justify-between mb-2">
              <span id="invoices-title" style={{color: tokens.colors.gray[600]}} className="text-sm">Factures (24h)</span>
              <FileText size={16} className="text-green-600" aria-hidden="true" />
            </div>
            <div style={{color: tokens.colors.gray[900]}} className="text-2xl font-bold">{invoices24h}</div>
            <div style={{color: tokens.colors.gray[500]}} className="text-xs mt-1">{invoices7d} sur 7 jours</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: tokens.borderRadius.xl,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: tokens.colors.gray[200]
          }} role="article" aria-labelledby="total-users-title">
            <div className="flex items-center justify-between mb-2">
              <span id="total-users-title" style={{color: tokens.colors.gray[600]}} className="text-sm">Total utilisateurs</span>
              <BarChart3 size={16} className="text-purple-600" aria-hidden="true" />
            </div>
            <div style={{color: tokens.colors.gray[900]}} className="text-2xl font-bold">{profiles?.length || 0}</div>
            <div style={{color: tokens.colors.gray[500]}} className="text-xs mt-1">{activeUsers30d} actifs (30j)</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: tokens.borderRadius.xl,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: tokens.colors.gray[200]
          }} role="article" aria-labelledby="activity-rate-title">
            <div className="flex items-center justify-between mb-2">
              <span id="activity-rate-title" style={{color: tokens.colors.gray[600]}} className="text-sm">Taux d'activité</span>
              <Activity size={16} className="text-amber-600" aria-hidden="true" />
            </div>
            <div style={{color: tokens.colors.gray[900]}} className="text-2xl font-bold">
              {profiles?.length ? ((activeUsers30d / profiles.length) * 100).toFixed(1) : 0}%
            </div>
            <div style={{color: tokens.colors.gray[500]}} className="text-xs mt-1">30 derniers jours</div>
          </div>
        </div>
      </section>

      {/* Graphiques */}
      <section role="region" aria-labelledby="charts-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <h2 id="charts-heading" className="sr-only">Graphiques de performance</h2>
        {/* Activité horaire */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: tokens.borderRadius.xl,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: tokens.colors.gray[200]
        }} role="region" aria-labelledby="hourly-activity-title">
          <h3 id="hourly-activity-title" style={{color: tokens.colors.gray[900]}} className="text-lg font-bold mb-4">Activité des 24 dernières heures</h3>
          <div className="space-y-3">
            {hourlyData.slice(-12).map((data, index) => (
              <div key={index} className="flex items-center gap-3">
                <div style={{color: tokens.colors.gray[600]}} className="w-12 text-xs font-medium">{data.hour}h</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div style={{color: tokens.colors.gray[500]}} className="text-xs w-16">Requêtes</div>
                    <div 
                      style={{backgroundColor: tokens.colors.gray[100]}}
                      role="progressbar"
                      aria-valuenow={data.requests}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(...hourlyData.map(d => d.requests))}
                      aria-label={`Requêtes à ${data.hour}h: ${data.requests}`}
                    >
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(data.requests / Math.max(...hourlyData.map(d => d.requests))) * 100}%` }}
                      />
                    </div>
                    <div style={{color: tokens.colors.gray[900]}} className="text-xs font-medium w-12 text-right">{data.requests}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div style={{color: tokens.colors.gray[500]}} className="text-xs w-16">Erreurs</div>
                    <div 
                      className="flex-1 bg-slate-100 rounded-full h-1 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={data.errors}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(...hourlyData.map(d => d.errors))}
                      aria-label={`Erreurs à ${data.hour}h: ${data.errors}`}
                    >
                      <div 
                        className="bg-red-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(data.errors / Math.max(...hourlyData.map(d => d.errors))) * 100}%` }}
                      />
                    </div>
                    <div style={{color: tokens.colors.error[600]}} className="text-xs font-medium text-error-600 w-12 text-right">{data.errors}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activité hebdomadaire */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: tokens.borderRadius.xl,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: tokens.colors.gray[200]
        }} role="region" aria-labelledby="weekly-activity-title">
          <h3 id="weekly-activity-title" style={{color: tokens.colors.gray[900]}} className="text-lg font-bold mb-4">Activité de la semaine</h3>
          <div className="space-y-4">
            {dailyData.map((data, index) => (
              <div key={index} className="flex items-center gap-4">
                <div style={{color: tokens.colors.gray[600]}} className="w-16 text-sm font-medium">{data.date}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div style={{color: tokens.colors.gray[500]}} className="text-xs w-12">Users</div>
                    <div 
                      style={{backgroundColor: tokens.colors.gray[100]}}
                      role="progressbar"
                      aria-valuenow={data.users}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(...dailyData.map(d => d.users))}
                      aria-label={`Utilisateurs ${data.date}: ${data.users}`}
                    >
                      <div 
                        className="bg-green-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(data.users / Math.max(...dailyData.map(d => d.users))) * 100}%` }}
                      />
                    </div>
                    <div style={{color: tokens.colors.gray[900]}} className="text-xs font-medium w-8 text-right">{data.users}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{color: tokens.colors.gray[500]}} className="text-xs w-12">Fact.</div>
                    <div 
                      style={{backgroundColor: tokens.colors.gray[100]}}
                      role="progressbar"
                      aria-valuenow={data.invoices}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(...dailyData.map(d => d.invoices))}
                      aria-label={`Factures ${data.date}: ${data.invoices}`}
                    >
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(data.invoices / Math.max(...dailyData.map(d => d.invoices))) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs font-medium text-slate-900 w-8 text-right">{data.invoices}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div style={{color: tokens.colors.success[600]}} className="text-sm font-bold">{(data.revenue / 1000).toFixed(1)}k FCFA</div>
                  <div className="text-xs text-slate-500">revenus</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alertes et monitoring */}
      <section role="region" aria-labelledby="monitoring-heading" style={{
        backgroundColor: 'white',
        borderRadius: tokens.borderRadius.xl,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: tokens.colors.gray[200]
      }} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 id="monitoring-heading" style={{color: tokens.colors.gray[900]}} className="text-lg font-bold">Alertes et Monitoring</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></span>
            <span className="text-xs text-green-600 font-medium">Système opérationnel</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{backgroundColor: tokens.colors.success[50]}}>
            <CheckCircle size={20} style={{color: tokens.colors.success[600]}} />
            <div>
              <div className="font-medium" style={{color: tokens.colors.success[900]}}>Tous les systèmes opérationnels</div>
              <div className="text-sm" style={{color: tokens.colors.success[700]}}>Aucune alerte critique détectée</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border" style={{borderColor: tokens.colors.gray[200]}}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} style={{color: tokens.colors.gray[600]}} />
                <span className="font-medium" style={{color: tokens.colors.gray[900]}}>Dernière vérification</span>
              </div>
              <div className="text-sm" style={{color: tokens.colors.gray[600]}}>
                {new Date().toLocaleString('fr-FR')}
              </div>
            </div>
            
            <div className="p-4 rounded-lg border" style={{borderColor: tokens.colors.gray[200]}}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} style={{color: tokens.colors.gray[600]}} />
                <span className="font-medium" style={{color: tokens.colors.gray[900]}}>Prochain backup</span>
              </div>
              <div className="text-sm" style={{color: tokens.colors.gray[600]}}>
                Dans 6 heures
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
