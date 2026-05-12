'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Rate limiting: max 3 tentatives par minute
const MAX_ATTEMPTS = 3
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

const ds = {
  color: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E5E7EB',
    borderFocus: '#2563EB',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    placeholder: '#94A3B8',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    success: '#22C55E',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    successBg: '#F0FDF4',
  },
  radius: {
    lg: '16px',
    md: '12px',
  },
  shadow: {
    card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 30px rgba(15, 23, 42, 0.06)',
  },
  font: {
    sans: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
} as const

type InputProps = {
  label: string
  type?: string
  value: string
  placeholder: string
  error?: string
  onChange: (value: string) => void
  autoComplete?: string
  fieldId?: string
}

function Field({
  label,
  type = 'text',
  value,
  placeholder,
  error,
  onChange,
  autoComplete,
  fieldId,
}: InputProps) {
  const errorId = fieldId ? `${fieldId}-error` : undefined
  
  return (
    <div className="space-y-2.5">
      <label 
        className="block text-sm font-medium" 
        style={{ color: ds.color.textSecondary }}
        htmlFor={fieldId}
      >
        {label}
      </label>
      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors"
        style={{
          backgroundColor: ds.color.card,
          borderColor: error ? ds.color.danger : ds.color.border,
          color: ds.color.textPrimary,
        }}
        onFocus={(event) => {
          event.currentTarget.style.borderColor = ds.color.borderFocus
          event.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'
        }}
        onBlur={(event) => {
          event.currentTarget.style.borderColor = error ? ds.color.danger : ds.color.border
          event.currentTarget.style.boxShadow = 'none'
        }}
      />
      {error ? (
        <p 
          id={errorId}
          className="text-xs" 
          style={{ color: ds.color.danger }}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

function PrimaryButton({ loading, disabled }: { loading: boolean; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        backgroundColor: loading || disabled ? '#94A3B8' : ds.color.primary,
      }}
      onMouseEnter={(event) => {
        if (!loading && !disabled) event.currentTarget.style.backgroundColor = ds.color.primaryHover
      }}
      onMouseLeave={(event) => {
        if (!loading && !disabled) event.currentTarget.style.backgroundColor = ds.color.primary
      }}
    >
      {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
    </button>
  )
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState<{ timestamp: number }[]>([])
  
  const emailInputRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  // Validation email améliorée
  const validateEmail = (email: string): string => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return 'Email requis'
    if (!EMAIL_REGEX.test(trimmedEmail)) return 'Format d\'email invalide'
    return ''
  }

  const emailError = validateEmail(email)

  // Rate limiting check
  const checkRateLimit = (): boolean => {
    const now = Date.now()
    const recentAttempts = attempts.filter(attempt => 
      now - attempt.timestamp < RATE_LIMIT_WINDOW
    )
    
    if (recentAttempts.length >= MAX_ATTEMPTS) {
      setError('Trop de tentatives. Veuillez réessayer dans 1 minute.')
      return false
    }
    
    setAttempts(recentAttempts)
    return true
  }

  // Focus management pour les erreurs
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus()
    }
  }, [error])

  const handleResetPassword = useCallback(async () => {
    const validationError = validateEmail(email)
    if (validationError) {
      setError(validationError)
      emailInputRef.current?.focus()
      return
    }

    // Rate limiting check
    if (!checkRateLimit()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        if (resetError.message?.includes('email')) {
          setError('Email non trouvé. Veuillez vérifier votre adresse.')
        } else {
          setError('Erreur serveur. Veuillez réessayer plus tard.')
        }
        setAttempts(prev => [...prev, { timestamp: Date.now() }])
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
      setAttempts(prev => [...prev, { timestamp: Date.now() }])
      setLoading(false)
    }
  }, [email, attempts])

  if (success) {
    return (
      <main
        className="min-h-screen px-4 py-8 sm:px-6 sm:py-10"
        style={{
          backgroundColor: ds.color.bg,
          fontFamily: ds.font.sans,
        }}
      >
        <div className="mx-auto w-full max-w-md">
          <header className="mb-8 text-center sm:mb-10">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div 
                  className="rounded-2xl p-4 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-16 w-16"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: ds.color.textPrimary }}>
              Email envoyé !
            </h1>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: ds.color.textMuted }}>
              Nous avons envoyé un lien de réinitialisation à<br/>
              <span className="font-medium" style={{ color: ds.color.primary }}>
                {email}
              </span>
            </p>
          </header>

          <section
            className="rounded-2xl border p-5 sm:p-7"
            style={{
              backgroundColor: ds.color.card,
              borderColor: ds.color.border,
              boxShadow: ds.shadow.card,
            }}
          >
            <div
              className="rounded-xl border px-4 py-4 text-sm"
              style={{
                backgroundColor: ds.color.successBg,
                borderColor: '#BBF7D0',
                color: '#166534',
              }}
            >
              <p className="font-medium mb-2">📧 Instructions envoyées</p>
              <p className="text-xs leading-relaxed">
                Vérifiez votre boîte de réception et cliquez sur le lien de réinitialisation. 
                Si vous ne voyez pas l'email, vérifiez dans vos spams.
              </p>
            </div>
          </section>

          <footer className="mt-6 space-y-3 text-center">
            <p className="text-sm" style={{ color: ds.color.textMuted }}>
              <Link href="/login" className="font-medium" style={{ color: ds.color.primary }}>
                Retour à la connexion
              </Link>
            </p>
          </footer>
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen px-4 py-8 sm:px-6 sm:py-10"
      style={{
        backgroundColor: ds.color.bg,
        fontFamily: ds.font.sans,
      }}
    >
      <div className="mx-auto w-full max-w-md">
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div 
                className="rounded-2xl p-4 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <Image 
                  src="/icon-192.png" 
                  alt="Factura Logo"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-xl"
                  priority
                  style={{
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                  }}
                />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: ds.color.textPrimary }}>
            Mot de passe oublié ?
          </h1>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: ds.color.textMuted }}>
            Entrez votre email et nous vous enverrons un lien<br/>
            pour réinitialiser votre mot de passe.
          </p>
        </header>

        <section
          className="rounded-2xl border p-5 sm:p-7"
          style={{
            backgroundColor: ds.color.card,
            borderColor: ds.color.border,
            boxShadow: ds.shadow.card,
          }}
        >
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              void handleResetPassword()
            }}
          >
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="vous@entreprise.com"
              autoComplete="email"
              error={emailError}
              fieldId="email-input"
            />

            {error ? (
              <div
                ref={errorRef}
                tabIndex={-1}
                className="rounded-xl border px-4 py-3 text-sm"
                style={{
                  backgroundColor: ds.color.dangerBg,
                  borderColor: '#FECACA',
                  color: ds.color.danger,
                }}
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            ) : null}

            <PrimaryButton loading={loading} disabled={!email.trim()} />
          </form>
        </section>

        <footer className="mt-6 space-y-3 text-center">
          <p className="text-sm" style={{ color: ds.color.textMuted }}>
            <Link href="/login" className="font-medium" style={{ color: ds.color.primary }}>
              Retour à la connexion
            </Link>
          </p>
          <p className="text-xs" style={{ color: ds.color.textMuted }}>
            Sécurisé, rapide, conçu pour les pros.
          </p>
        </footer>
      </div>
    </main>
  )
}
