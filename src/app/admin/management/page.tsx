import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { UserManagementActions } from '@/components/admin/UserManagementActions'
import { StorageQuotaManager } from '@/components/admin/StorageQuotaManager'
import { DataExportManager } from '@/components/admin/DataExportManager'
import { ActivityLogsViewer } from '@/components/admin/ActivityLogsViewer'
import { AdvancedPermissionsManager } from '@/components/admin/AdvancedPermissionsManager'
import { 
  Settings, 
  Users, 
  HardDrive, 
  Download, 
  Activity, 
  Shield, 
  Search, 
  Filter, 
  RefreshCw,
  BarChart3,
  Database,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default async function AdminManagementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  const adminClient = createAdminClient()

  // Récupération des données
  let profiles: any[] | null = null
  let invoices: any[] | null = null
  let clients: any[] | null = null
  let logs: any[] | null = null
  
  try {
    const [
      profilesPromise,
      invoicesPromise,
      clientsPromise,
      logsPromise
    ] = [
      adminClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      
      adminClient
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500),
      
      adminClient
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500),
      
      // Logs simulés pour l'exemple
      Promise.resolve([
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          category: 'admin',
          action: 'login',
          description: 'Administrateur connecté',
          user_email: user.email,
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          level: 'success',
          category: 'user',
          action: 'user_created',
          description: 'Nouvel utilisateur créé',
          user_email: 'user@example.com',
          metadata: { userId: '123', plan: 'free' }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          level: 'warning',
          category: 'security',
          action: 'failed_login',
          description: 'Échec de connexion multiple',
          user_email: 'suspicious@example.com',
          ip_address: '192.168.1.100',
          metadata: { attempts: 5, locked: true }
        }
      ])
    ]

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    )

    const [
      profilesResult,
      invoicesResult,
      clientsResult,
      logsResult
    ] = await Promise.all([
      Promise.race([profilesPromise, timeoutPromise]),
      Promise.race([invoicesPromise, timeoutPromise]),
      Promise.race([clientsPromise, timeoutPromise]),
      Promise.race([logsPromise, timeoutPromise])
    ])

    profiles = (profilesResult as any)?.data || []
    invoices = (invoicesResult as any)?.data || []
    clients = (clientsResult as any)?.data || []
    logs = (logsResult as any) || []
  } catch (error) {
    console.error('Erreur lors du chargement des données de gestion:', error)
    profiles = []
    invoices = []
    clients = []
    logs = []
  }

  // Préparation des données pour les composants
  const storageQuotas = profiles?.map((profile: any) => ({
    user_id: profile.id,
    user_email: profile.email,
    company_name: profile.company_name,
    plan: profile.plan,
    used_bytes: Math.floor(Math.random() * 1048576 * 100) + 1048576, // 1MB - 100MB simulé
    limit_bytes: profile.plan === 'pro' ? 52428800 : 10485760, // 50MB Pro, 10MB Free
    file_count: Math.floor(Math.random() * 50) + 5,
    last_updated: new Date().toISOString()
  })) || []

  const exportHistory = [
    {
      id: '1',
      type: 'users',
      format: 'csv',
      status: 'completed' as const,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date(Date.now() - 3000000).toISOString(),
      file_size: 1048576,
      download_url: '/exports/users.csv',
      created_by: user.email || 'admin'
    },
    {
      id: '2',
      type: 'invoices',
      format: 'excel',
      status: 'processing' as const,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      created_by: user.email || 'admin'
    }
  ]

  const permissions = [
    {
      id: '1',
      name: 'Lire les utilisateurs',
      description: 'Voir la liste des utilisateurs',
      category: 'user' as const,
      level: 'read' as const,
      resource: 'users'
    },
    {
      id: '2',
      name: 'Gérer les utilisateurs',
      description: 'Créer, modifier, supprimer des utilisateurs',
      category: 'user' as const,
      level: 'admin' as const,
      resource: 'users'
    },
    {
      id: '3',
      name: 'Voir les factures',
      description: 'Accéder aux factures et devis',
      category: 'billing' as const,
      level: 'read' as const,
      resource: 'invoices'
    },
    {
      id: '4',
      name: 'Administrer système',
      description: 'Accès complet à l\'administration',
      category: 'admin' as const,
      level: 'super' as const,
      resource: 'system'
    }
  ]

  const roles = [
    {
      id: '1',
      name: 'Administrateur',
      description: 'Accès complet à la plateforme',
      permissions: ['1', '2', '3', '4'],
      is_system: true,
      user_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Support',
      description: 'Support client et gestion des utilisateurs',
      permissions: ['1', '3'],
      is_system: false,
      user_count: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const userRoles = [
    {
      id: '1',
      user_id: user.id,
      user_email: user.email || '',
      user_name: 'Admin',
      role_id: '1',
      role_name: 'Administrateur',
      granted_at: new Date().toISOString(),
      granted_by: user.email || 'admin',
      is_active: true
    }
  ]

  // Fonctions handlers
  const handleUserAction = async (action: string, userId: string, data?: any) => {
    console.log(`Action ${action} sur utilisateur ${userId}`, data)
    // Implémenter la logique réelle ici
  }

  const handleUpdateQuota = async (userId: string, newLimit: number) => {
    console.log(`Mise à jour quota pour ${userId}: ${newLimit} bytes`)
    // Implémenter la logique réelle ici
  }

  const handleExport = async (config: any): Promise<string> => {
    console.log('Export demandé:', config)
    return 'export-id-' + Date.now()
  }

  const handleDownload = (exportId: string) => {
    console.log(`Téléchargement de l'export ${exportId}`)
    // Implémenter la logique réelle ici
  }

  const handleDeleteExport = (exportId: string) => {
    console.log(`Suppression de l'export ${exportId}`)
    // Implémenter la logique réelle ici
  }

  const handleLoadMoreLogs = async (offset: number, limit: number) => {
    console.log(`Chargement de logs: offset=${offset}, limit=${limit}`)
    // Implémenter la logique réelle ici
  }

  // Handlers pour les permissions
  const handleCreateRole = async (role: any) => {
    console.log('Création rôle:', role)
  }

  const handleUpdateRole = async (roleId: string, role: any) => {
    console.log(`Mise à jour rôle ${roleId}:`, role)
  }

  const handleDeleteRole = async (roleId: string) => {
    console.log(`Suppression rôle ${roleId}`)
  }

  const handleAssignRole = async (userId: string, roleId: string, expiresAt?: string) => {
    console.log(`Attribution rôle ${roleId} à utilisateur ${userId}`)
  }

  const handleRevokeRole = async (userRoleId: string) => {
    console.log(`Révocation attribution ${userRoleId}`)
  }

  const handleCreatePermission = async (permission: any) => {
    console.log('Création permission:', permission)
  }

  const handleUpdatePermission = async (permissionId: string, permission: any) => {
    console.log(`Mise à jour permission ${permissionId}:`, permission)
  }

  const handleDeletePermission = async (permissionId: string) => {
    console.log(`Suppression permission ${permissionId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion Avancée</h1>
          <p className="text-slate-600 mt-1">Outils de gestion et monitoring de la plateforme</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Temps réel</span>
        </div>
      </div>

      {/* Statistiques rapides */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Utilisateurs actifs</span>
            <Users size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{profiles?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">total inscrits</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Stockage utilisé</span>
            <HardDrive size={16} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {storageQuotas.reduce((sum, q) => sum + q.used_bytes, 0) > 0 
              ? `${((storageQuotas.reduce((sum, q) => sum + q.used_bytes, 0) / 1024 / 1024).toFixed(1))}MB`
              : '0MB'
            }
          </div>
          <div className="text-xs text-slate-500 mt-1">espace total</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Exports récents</span>
            <Download size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{exportHistory.length}</div>
          <div className="text-xs text-slate-500 mt-1">cette semaine</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Logs d'activité</span>
            <Activity size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{logs?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">24 dernières heures</div>
        </div>
      </section>

      {/* Gestion des utilisateurs */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Gestion des Utilisateurs</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{profiles?.length || 0} utilisateurs</span>
          </div>
        </div>

        <div className="space-y-4">
          {profiles?.slice(0, 3).map((profile: any) => (
            <div key={profile.id} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-slate-600 font-bold">
                      {(profile.company_name || profile.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {profile.company_name || 'Sans entreprise'}
                    </p>
                    <p className="text-sm text-slate-500">{profile.email}</p>
                  </div>
                </div>
                
                <div className="flex-1 lg:flex lg:justify-end">
                  <UserManagementActions
                    user={{
                      id: profile.id,
                      email: profile.email,
                      company_name: profile.company_name,
                      plan: profile.plan,
                      status: 'active',
                      created_at: profile.created_at,
                      storage_used: storageQuotas.find(q => q.user_id === profile.id)?.used_bytes,
                      storage_limit: storageQuotas.find(q => q.user_id === profile.id)?.limit_bytes
                    }}
                    onAction={handleUserAction}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gestion des quotas de stockage */}
      <section>
        <StorageQuotaManager
          quotas={storageQuotas}
          onUpdateQuota={handleUpdateQuota}
          onRefresh={() => console.log('Refresh quotas')}
        />
      </section>

      {/* Export de données */}
      <section>
        <DataExportManager
          onExport={handleExport}
          exportHistory={exportHistory}
          onDownload={handleDownload}
          onDelete={handleDeleteExport}
        />
      </section>

      {/* Logs d'activité */}
      <section>
        <ActivityLogsViewer
          logs={logs || []}
          onLoadMore={handleLoadMoreLogs}
          onExport={async (filters: any) => { await handleExport(filters); }}
          totalLogs={logs?.length || 0}
          loading={false}
        />
      </section>

      {/* Permissions avancées */}
      <section>
        <AdvancedPermissionsManager
          permissions={permissions}
          roles={roles}
          userRoles={userRoles}
          onCreateRole={handleCreateRole}
          onUpdateRole={handleUpdateRole}
          onDeleteRole={handleDeleteRole}
          onAssignRole={handleAssignRole}
          onRevokeRole={handleRevokeRole}
          onCreatePermission={handleCreatePermission}
          onUpdatePermission={handleUpdatePermission}
          onDeletePermission={handleDeletePermission}
        />
      </section>
    </div>
  )
}
