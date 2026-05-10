'use client'

import { useMemo } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { useOnlineStatus, useLocalStorage } from '@/hooks/useIsClient'

const LAST_SYNC_KEY = 'factura:last-sync'

function formatSyncDate(value: string | null): string {
  if (!value) return 'jamais'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'jamais'
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function ConnectionStatus({ compact = false }: { compact?: boolean }) {
  const isOnline = useOnlineStatus()
  const [lastSync] = useLocalStorage<string | null>(LAST_SYNC_KEY, null)

  const syncLabel = useMemo(() => formatSyncDate(lastSync), [lastSync])

  if (compact) {
    return (
      <div
        className={`hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium sm:flex ${
          isOnline ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
        }`}
      >
        {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
        {isOnline ? 'En ligne' : 'Hors ligne'}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
          isOnline ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
        }`}
      >
        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        {isOnline ? 'Synchronisation active' : 'Mode hors ligne actif'}
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Derniere sync: {syncLabel}
      </div>
    </div>
  )
}
