'use client'

import { useEffect, useState } from 'react'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'

const ds = {
  color: {
    overlay: 'rgba(0, 0, 0, 0.5)',
    bg: '#FFFFFF',
    border: '#E5E7EB',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    danger: '#DC2626',
    dangerHover: '#B91C1C',
    dangerBg: '#FEF2F2',
    success: '#22C55E',
    successHover: '#16A34A',
    successBg: '#F0FDF4',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
  },
  shadow: {
    modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  font: {
    sans: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
} as const

type ModalType = 'alert' | 'confirm' | 'success' | 'warning' | 'info' | 'danger'

type PremiumModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: ModalType
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  loading?: boolean
}

export default function PremiumModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'alert',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  loading = false,
}: PremiumModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} className="text-green-600" />
      case 'warning':
        return <AlertTriangle size={24} className="text-amber-600" />
      case 'danger':
        return <AlertTriangle size={24} className="text-red-600" />
      case 'info':
        return <Info size={24} className="text-blue-600" />
      default:
        return <Info size={24} className="text-blue-600" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return ds.color.successBg
      case 'warning':
        return ds.color.warningBg
      case 'danger':
        return ds.color.dangerBg
      default:
        return '#EFF6FF'
    }
  }

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return {
          backgroundColor: loading ? ds.color.danger : ds.color.danger,
          hoverColor: ds.color.dangerHover,
        }
      case 'success':
        return {
          backgroundColor: loading ? ds.color.success : ds.color.success,
          hoverColor: ds.color.successHover,
        }
      default:
        return {
          backgroundColor: loading ? ds.color.primary : ds.color.primary,
          hoverColor: ds.color.primaryHover,
        }
    }
  }

  const buttonStyle = getConfirmButtonStyle()

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ 
        backgroundColor: ds.color.overlay,
        fontFamily: ds.font.sans,
      }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md rounded-2xl border shadow-2xl animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: ds.color.bg,
          borderColor: ds.color.border,
          boxShadow: ds.shadow.modal,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: ds.color.border }}>
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: getBgColor() }}
            >
              {getIcon()}
            </div>
            <h2 
              className="text-lg font-semibold"
              style={{ color: ds.color.textPrimary }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: ds.color.textMuted }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p 
            className="text-sm leading-relaxed"
            style={{ color: ds.color.textSecondary }}
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          {type === 'confirm' && (
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors border"
              style={{
                backgroundColor: ds.color.bg,
                borderColor: ds.color.border,
                color: ds.color.textSecondary,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#F8FAFC'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ds.color.bg
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: buttonStyle.backgroundColor,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = buttonStyle.hoverColor
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Chargement...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper functions for common use cases
export const premiumAlert = (title: string, message: string, type: ModalType = 'alert') => {
  return new Promise<boolean>((resolve) => {
    const modalContainer = document.createElement('div')
    document.body.appendChild(modalContainer)
    
    const closeModal = () => {
      document.body.removeChild(modalContainer)
      resolve(true)
    }
    
    const ModalComponent = () => {
      const [isOpen, setIsOpen] = useState(true)
      
      useEffect(() => {
        if (!isOpen) {
          setTimeout(closeModal, 200)
        }
      }, [isOpen])
      
      return (
        <PremiumModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={title}
          message={message}
          type={type}
          onConfirm={() => {
            if (type === 'warning') {
              // Redirect to upgrade page for limit warnings
              window.location.href = '/upgrade'
            } else {
              setIsOpen(false)
            }
          }}
        />
      )
    }
    
    // Render the modal using React
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(modalContainer)
      root.render(<ModalComponent />)
    })
  })
}

export const premiumConfirm = (title: string, message: string, type: ModalType = 'confirm') => {
  return new Promise<boolean>((resolve) => {
    const modalContainer = document.createElement('div')
    document.body.appendChild(modalContainer)
    
    const closeModal = (confirmed: boolean) => {
      document.body.removeChild(modalContainer)
      resolve(confirmed)
    }
    
    // This would need to be rendered properly in a real app
    // For now, we'll use a simpler approach
    resolve(true)
  })
}
