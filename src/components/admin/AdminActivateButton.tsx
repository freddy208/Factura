'use client'
import { useState } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Zap, Shield, Check } from 'lucide-react'

type Props = {
  userId: string
  requestId: string | null
  userEmail: string
  compact?: boolean
}

export default function AdminActivateButton({
  userId,
  requestId,
  userEmail,
  compact = false,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleActivate() {
    if (!confirm(`Activer le plan Pro pour ${userEmail} ?`)) return

    setLoading(true)

    try {
      const adminClient = createAdminClient()

      // Activer le plan Pro
      await (adminClient
        .from('profiles') as any)
        .update({
          plan: 'pro',
          pro_activated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      // Valider la demande si elle existe
      if (requestId) {
        await (adminClient
          .from('payment_requests') as any)
          .update({
            status: 'validated',
            validated_by: 'admin',
            validated_at: new Date().toISOString(),
          })
          .eq('id', requestId)
      }

      setDone(true)
      window.location.reload()

    } catch (err) {
      console.error('Activation error:', err)
      alert('Erreur lors de l\'activation.')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
        <Check size={14} className="text-green-600" />
        <span className="text-xs font-medium text-green-700">Activé</span>
      </div>
    )
  }

  if (compact) {
    return (
      <button
        onClick={handleActivate}
        disabled={loading}
        className="tap-target inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-3 py-1.5 rounded-xl transition-all text-xs shadow-sm"
      >
        {loading ? (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <Zap size={12} />
            <span>Activer Pro</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleActivate}
      disabled={loading}
      className="tap-target group inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Activation...</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-lg">
            <Shield size={14} className="text-white" />
            <Zap size={14} />
          </div>
          <span>Activer le plan Pro</span>
        </>
      )}
    </button>
  )
}