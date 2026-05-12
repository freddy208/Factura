'use client'

import { useState } from 'react'
import { 
  Power, 
  PowerOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Ban,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Upload,
  HardDrive,
  Users,
  Settings,
  Lock,
  Unlock
} from 'lucide-react'

interface User {
  id: string
  email: string
  company_name: string | null
  plan: 'free' | 'pro'
  status: 'active' | 'suspended' | 'pending'
  created_at: string
  last_activity?: string
  storage_used?: number
  storage_limit?: number
}

interface UserManagementActionsProps {
  user: User
  onAction: (action: string, userId: string, data?: any) => void
  compact?: boolean
}

export function UserManagementActions({ user, onAction, compact = false }: UserManagementActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (action: string, data?: any) => {
    setLoading(action)
    try {
      await onAction(action, user.id, data)
    } finally {
      setLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-amber-600 bg-amber-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'suspended': return Ban
      case 'pending': return Clock
      default: return Users
    }
  }

  const StatusIcon = getStatusIcon(user.status)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${getStatusColor(user.status)}`}>
          <StatusIcon size={12} />
          {user.status === 'active' ? 'Actif' : 
           user.status === 'suspended' ? 'Suspendu' : 
           user.status === 'pending' ? 'En attente' : user.status}
        </span>
        
        {user.status === 'active' ? (
          <button
            onClick={() => handleAction('suspend')}
            disabled={loading === 'suspend'}
            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Suspendre le compte"
          >
            {loading === 'suspend' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <PowerOff size={16} />
            )}
          </button>
        ) : (
          <button
            onClick={() => handleAction('reactivate')}
            disabled={loading === 'reactivate'}
            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Réactiver le compte"
          >
            {loading === 'reactivate' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Power size={16} />
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Statut du compte */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          <StatusIcon size={20} className={user.status === 'active' ? 'text-green-600' : user.status === 'suspended' ? 'text-red-600' : 'text-amber-600'} />
          <div>
            <h3 className="font-medium text-slate-900">Statut du compte</h3>
            <p className="text-sm text-slate-500">
              {user.status === 'active' ? 'Compte actif et fonctionnel' :
               user.status === 'suspended' ? 'Compte suspendu - accès limité' :
               'Compte en attente de validation'}
            </p>
          </div>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1 ${getStatusColor(user.status)}`}>
          <StatusIcon size={14} />
          {user.status === 'active' ? 'Actif' : 
           user.status === 'suspended' ? 'Suspendu' : 
           user.status === 'pending' ? 'En attente' : user.status}
        </span>
      </div>

      {/* Actions principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {user.status === 'active' ? (
          <button
            onClick={() => handleAction('suspend')}
            disabled={loading === 'suspend'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'suspend' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <PowerOff size={16} />
            )}
            <span className="font-medium">Suspendre</span>
          </button>
        ) : (
          <button
            onClick={() => handleAction('reactivate')}
            disabled={loading === 'reactivate'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'reactivate' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Power size={16} />
            )}
            <span className="font-medium">Réactiver</span>
          </button>
        )}

        <button
          onClick={() => handleAction('resetPassword')}
          disabled={loading === 'resetPassword'}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'resetPassword' ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Lock size={16} />
          )}
          <span className="font-medium">Réinitialiser mot de passe</span>
        </button>
      </div>

      {/* Actions secondaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => handleAction('toggleTwoFactor')}
          disabled={loading === 'toggleTwoFactor'}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'toggleTwoFactor' ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Shield size={16} />
          )}
          <span className="text-sm font-medium">2FA</span>
        </button>

        <button
          onClick={() => handleAction('viewLogs')}
          disabled={loading === 'viewLogs'}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'viewLogs' ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Eye size={16} />
          )}
          <span className="text-sm font-medium">Voir les logs</span>
        </button>
      </div>

      {/* Stockage */}
      {(user.storage_used !== undefined && user.storage_limit !== undefined) && (
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive size={16} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Stockage utilisé</span>
            </div>
            <span className="text-sm text-slate-600">
              {((user.storage_used / 1024 / 1024).toFixed(1))}MB / {((user.storage_limit / 1024 / 1024).toFixed(1))}MB
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                (user.storage_used / user.storage_limit) > 0.9 ? 'bg-red-500' :
                (user.storage_used / user.storage_limit) > 0.7 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((user.storage_used / user.storage_limit) * 100, 100)}%` }}
            />
          </div>
          <button
            onClick={() => handleAction('manageStorage')}
            disabled={loading === 'manageStorage'}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Gérer le stockage →
          </button>
        </div>
      )}

      {/* Dernière activité */}
      {user.last_activity && (
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock size={14} />
            <span>Dernière activité: {new Date(user.last_activity).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
