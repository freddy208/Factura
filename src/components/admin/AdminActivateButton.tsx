'use client'

import { useState, useRef, useEffect } from 'react'
import { Zap, Shield, Check } from 'lucide-react'
import { usePremiumModal } from '@/hooks/usePremiumModal'

type Props = {
  userId: string
  requestId: string | null
  userEmail: string
  compact?: boolean
}

export function AdminActivateButton({
  userId,
  requestId,
  userEmail,
  compact = false,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { confirm, alert, setLoading: setModalLoading, ModalComponent } = usePremiumModal()
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Gestion du focus clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        if (document.activeElement === buttonRef.current && !loading && !done) {
          event.preventDefault()
          handleActivate()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [loading, done])

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
          ref={buttonRef}
          onClick={handleActivate}
          disabled={loading}
          className="tap-target inline-flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-xl transition-all text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            color: 'white',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
            }
          }}
          aria-label={`Activer le plan Pro pour ${userEmail}`}
          aria-describedby={loading ? 'activation-loading' : undefined}
          aria-busy={loading}
          role="button"
          tabIndex={0}
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
              <span id="activation-loading" className="sr-only">Activation en cours...</span>
              <span aria-hidden="true">...</span>
            </>
          ) : (
            <>
              <Zap size={12} aria-hidden="true" />
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
        ref={buttonRef}
        onClick={handleActivate}
        disabled={loading}
        className="tap-target group inline-flex items-center gap-2.5 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          color: 'white',
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
          transform: loading ? 'none' : ''
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)'
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)'
          }
        }}
        aria-label={`Activer le plan Pro pour ${userEmail}`}
        aria-describedby={loading ? 'activation-loading-full' : undefined}
        aria-busy={loading}
        role="button"
        tabIndex={0}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
            <span id="activation-loading-full" className="sr-only">Activation du plan Pro en cours...</span>
            <span>Activation...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}} aria-hidden="true">
              <Shield size={14} style={{color: 'white'}} />
              <Zap size={14} />
            </div>
            <span>Activer le plan Pro</span>
          </>
        )}
      </button>
    </>
  )
}
