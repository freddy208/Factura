'use client'

import { useState } from 'react'
import { Zap, Shield, Check } from 'lucide-react'
import { usePremiumModal } from '@/hooks/usePremiumModal'

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
  const { confirm, alert, setLoading: setModalLoading, ModalComponent } = usePremiumModal()

  async function handleActivate() {
    const confirmed = await confirm(
      'Activer le plan Pro',
      `Activer le plan Pro pour ${userEmail} ?`,
      'success',
      { confirmText: 'Activer', cancelText: 'Annuler' }
    )
    if (!confirmed) return

    setLoading(true)
    setModalLoading(true)

    try {
      const res = await fetch('/api/admin/activate-pro', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          requestId: requestId || null,
        }),
      })

      const data = (await res.json().catch(() => ({}))) as { error?: string }

      if (!res.ok) {
        await alert('Erreur d\'activation', data.error || 'Erreur lors de l\'activation.', 'danger')
        setModalLoading(false)
        setLoading(false)
        return
      }

      setDone(true)
      window.location.reload()
    } catch (err) {
      console.error('Activation error:', err)
      await alert('Erreur d\'activation', 'Erreur lors de l\'activation du plan Pro.', 'danger')
      setModalLoading(false)
      setLoading(false)
    }
  }

  if (done) {
    return (
      <>
        <ModalComponent />
        <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
          <Check size={14} className="text-green-600" />
          <span className="text-xs font-medium text-green-700">Activé</span>
        </div>
      </>
    )
  }

  if (compact) {
    return (
      <>
        <ModalComponent />
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
      </>
    )
  }

  return (
    <>
      <ModalComponent />
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
    </>
  )
}
