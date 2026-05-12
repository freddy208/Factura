'use client'

import { useState } from 'react'
import { 
  Shield, 
  Users, 
  Settings, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Key, 
  Crown, 
  User, 
  UserPlus, 
  UserMinus, 
  Database, 
  FileText, 
  CreditCard, 
  Mail, 
  Zap, 
  BarChart3, 
  Search, 
  Filter, 
  MoreHorizontal,
  Copy,
  Download,
  Upload
} from 'lucide-react'

interface Permission {
  id: string
  name: string
  description: string
  category: 'user' | 'billing' | 'admin' | 'system' | 'api'
  level: 'read' | 'write' | 'admin' | 'super'
  resource: string
  conditions?: Record<string, any>
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  is_system: boolean
  user_count: number
  created_at: string
  updated_at: string
}

interface UserRole {
  id: string
  user_id: string
  user_email: string
  user_name: string
  role_id: string
  role_name: string
  granted_at: string
  granted_by: string
  expires_at?: string
  is_active: boolean
}

interface AdvancedPermissionsManagerProps {
  permissions: Permission[]
  roles: Role[]
  userRoles: UserRole[]
  onCreateRole: (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onUpdateRole: (roleId: string, role: Partial<Role>) => Promise<void>
  onDeleteRole: (roleId: string) => Promise<void>
  onAssignRole: (userId: string, roleId: string, expiresAt?: string) => Promise<void>
  onRevokeRole: (userRoleId: string) => Promise<void>
  onCreatePermission: (permission: Omit<Permission, 'id'>) => Promise<void>
  onUpdatePermission: (permissionId: string, permission: Partial<Permission>) => Promise<void>
  onDeletePermission: (permissionId: string) => Promise<void>
}

export function AdvancedPermissionsManager({
  permissions,
  roles,
  userRoles,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onAssignRole,
  onRevokeRole,
  onCreatePermission,
  onUpdatePermission,
  onDeletePermission
}: AdvancedPermissionsManagerProps) {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'assignments'>('roles')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState<string | null>(null)
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [showCreatePermission, setShowCreatePermission] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredUserRoles = userRoles.filter(userRole =>
    userRole.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userRole.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPermissionIcon = (category: string) => {
    switch (category) {
      case 'user': return Users
      case 'billing': return CreditCard
      case 'admin': return Shield
      case 'system': return Settings
      case 'api': return Zap
      default: return Lock
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'read': return 'text-blue-600 bg-blue-100'
      case 'write': return 'text-green-600 bg-green-100'
      case 'admin': return 'text-amber-600 bg-amber-100'
      case 'super': return 'text-red-600 bg-red-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user': return 'text-blue-600 bg-blue-50'
      case 'billing': return 'text-green-600 bg-green-50'
      case 'admin': return 'text-amber-600 bg-amber-50'
      case 'system': return 'text-purple-600 bg-purple-50'
      case 'api': return 'text-indigo-600 bg-indigo-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'user', label: 'Utilisateur' },
    { value: 'billing', label: 'Facturation' },
    { value: 'admin', label: 'Administration' },
    { value: 'system', label: 'Système' },
    { value: 'api', label: 'API' }
  ]

  const handleCreateRole = async (roleData: any) => {
    setLoading('create-role')
    try {
      await onCreateRole(roleData)
      setShowCreateRole(false)
    } finally {
      setLoading(null)
    }
  }

  const handleUpdateRole = async (roleId: string, roleData: any) => {
    setLoading(`update-role-${roleId}`)
    try {
      await onUpdateRole(roleId, roleData)
      setEditingRole(null)
    } finally {
      setLoading(null)
    }
  }

  const handleCreatePermission = async (permissionData: any) => {
    setLoading('create-permission')
    try {
      await onCreatePermission(permissionData)
      setShowCreatePermission(false)
    } finally {
      setLoading(null)
    }
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
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'roles' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Crown size={16} />
            <span className="text-sm font-medium">Rôles</span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'permissions' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Key size={16} />
            <span className="text-sm font-medium">Permissions</span>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'assignments' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users size={16} />
            <span className="text-sm font-medium">Attributions</span>
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {activeTab === 'permissions' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          )}

          <div className="flex gap-2">
            {activeTab === 'roles' && (
              <button
                onClick={() => setShowCreateRole(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm font-medium">Nouveau rôle</span>
              </button>
            )}
            {activeTab === 'permissions' && (
              <button
                onClick={() => setShowCreatePermission(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm font-medium">Nouvelle permission</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Onglet Rôles */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <div key={role.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      role.is_system ? 'bg-slate-100' : 'bg-blue-100'
                    }`}>
                      <Crown size={20} className={role.is_system ? 'text-slate-600' : 'text-blue-600'} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{role.name}</h3>
                      <p className="text-sm text-slate-500">{role.user_count} utilisateur(s)</p>
                    </div>
                  </div>
                  {!role.is_system && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingRole(role)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteRole(role.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-slate-600 mb-4">{role.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Permissions</span>
                    <span className="font-medium text-slate-900">{role.permissions.length}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permissionId) => {
                      const permission = permissions.find(p => p.id === permissionId)
                      if (!permission) return null
                      const Icon = getPermissionIcon(permission.category)
                      return (
                        <span
                          key={permissionId}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(permission.category)}`}
                        >
                          <Icon size={10} />
                          {permission.name}
                        </span>
                      )
                    })}
                    {role.permissions.length > 3 && (
                      <span className="text-xs text-slate-500">+{role.permissions.length - 3} plus</span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                    Créé le {formatDate(role.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglet Permissions */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Liste des permissions</h3>
                <span className="text-sm text-slate-500">{filteredPermissions.length} permissions</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredPermissions.map((permission) => {
                const Icon = getPermissionIcon(permission.category)
                return (
                  <div key={permission.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(permission.category)}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900">{permission.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLevelColor(permission.level)}`}>
                              {permission.level.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(permission.category)}`}>
                              {permission.category.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{permission.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Ressource: <code className="bg-slate-100 px-1 rounded">{permission.resource}</code></span>
                            <span>Utilisée par {roles.filter(r => r.permissions.includes(permission.id)).length} rôle(s)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingPermission(permission)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => onDeletePermission(permission.id)}
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
          </div>
        </div>
      )}

      {/* Onglet Attributions */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Attributions de rôles</h3>
                <span className="text-sm text-slate-500">{filteredUserRoles.length} attributions</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredUserRoles.map((userRole) => (
                <div key={userRole.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{userRole.user_name}</p>
                        <p className="text-sm text-slate-500">{userRole.user_email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-slate-900">{userRole.role_name}</p>
                        <p className="text-sm text-slate-500">
                          Attribué le {formatDate(userRole.granted_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          userRole.is_active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                        }`}>
                          {userRole.is_active ? 'Actif' : 'Inactif'}
                        </span>
                        
                        <button
                          onClick={() => onRevokeRole(userRole.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Création/Édition Rôle */}
      {(showCreateRole || editingRole) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {editingRole ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateRole(false)
                  setEditingRole(null)
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const roleData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                permissions: formData.getAll('permissions') as string[]
              }
              
              if (editingRole) {
                handleUpdateRole(editingRole.id, roleData)
              } else {
                handleCreateRole(roleData)
              }
            }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom du rôle
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingRole?.name || ''}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingRole?.description || ''}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {permissions.map((permission) => {
                    const Icon = getPermissionIcon(permission.category)
                    const isChecked = editingRole?.permissions.includes(permission.id)
                    return (
                      <label key={permission.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          name="permissions"
                          value={permission.id}
                          defaultChecked={isChecked}
                          className="text-blue-600"
                        />
                        <Icon size={16} className={getCategoryColor(permission.category).split(' ')[0]} />
                        <div className="flex-1">
                          <span className="font-medium text-slate-900">{permission.name}</span>
                          <span className="text-sm text-slate-500 ml-2">{permission.description}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading === 'create-role' || loading?.startsWith('update-role')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading === 'create-role' || loading?.startsWith('update-role') ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span className="font-medium">
                    {editingRole ? 'Mettre à jour' : 'Créer'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateRole(false)
                    setEditingRole(null)
                  }}
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Création Permission */}
      {showCreatePermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Créer une nouvelle permission</h3>
              <button
                onClick={() => setShowCreatePermission(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const permissionData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                category: formData.get('category') as any,
                level: formData.get('level') as any,
                resource: formData.get('resource') as string
              }
              
              handleCreatePermission(permissionData)
            }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de la permission
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Catégorie
                  </label>
                  <select name="category" required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="user">Utilisateur</option>
                    <option value="billing">Facturation</option>
                    <option value="admin">Administration</option>
                    <option value="system">Système</option>
                    <option value="api">API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Niveau
                  </label>
                  <select name="level" required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="read">Lecture</option>
                    <option value="write">Écriture</option>
                    <option value="admin">Admin</option>
                    <option value="super">Super</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ressource
                </label>
                <input
                  type="text"
                  name="resource"
                  placeholder="ex: users, invoices, settings"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading === 'create-permission'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading === 'create-permission' ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span className="font-medium">Créer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePermission(false)}
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
