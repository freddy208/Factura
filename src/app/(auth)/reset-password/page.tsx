'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSafeRouter } from '@/hooks/useRouter'
import { createClient } from '@/lib/supabase/client'

// Password validation requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
}

// Rate limiting: max 3 tentatives par minute
const MAX_ATTEMPTS = 3
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

// Common weak passwords to block
const COMMON_PASSWORDS = [
  'password', '12345678', 'qwerty123', 'admin123', 'password123',
  '123456789', 'welcome123', 'abc12345', 'password1', '123123123'
]

const ds = {
  color: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E5E7EB',
    borderFocus: '#2563EB', // Harmonisé avec forgot-password
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    placeholder: '#94A3B8',
    primary: '#2563EB', // Harmonisé avec forgot-password
    primaryHover: '#1D4ED8',
    success: '#22C55E',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    successBg: '#F0FDF4',
  },
  radius: {
    lg: '16px',
    md: '12px',
    sm: '8px',
  },
  shadow: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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
  showPasswordToggle?: boolean
  onPasswordToggle?: () => void
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
  showPasswordToggle,
  onPasswordToggle,
  fieldId,
}: InputProps) {
  const errorId = fieldId ? `${fieldId}-error` : undefined
  
  return (
    <div className="space-y-3">
      <label 
        className="block text-sm font-semibold" 
        style={{ color: ds.color.textSecondary }}
        htmlFor={fieldId}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="w-full rounded-xl border px-4 py-3.5 text-[15px] outline-none transition-all duration-200 pr-14"
          style={{
            backgroundColor: ds.color.card,
            borderColor: error ? ds.color.danger : ds.color.border,
            color: ds.color.textPrimary,
          }}
          onFocus={(event) => {
            event.currentTarget.style.borderColor = ds.color.borderFocus
            event.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'
            event.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onBlur={(event) => {
            event.currentTarget.style.borderColor = error ? ds.color.danger : ds.color.border
            event.currentTarget.style.boxShadow = 'none'
            event.currentTarget.style.transform = 'translateY(0)'
          }}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onPasswordToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
            style={{ color: ds.color.textMuted }}
            aria-label={type === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
          >
            {type === 'password' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        )}
      </div>
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
      className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm hover:shadow-md"
      style={{
        backgroundColor: loading || disabled ? '#CBD5E1' : ds.color.primary,
        transform: loading || disabled ? 'none' : 'translateY(0)',
      }}
      onMouseEnter={(event) => {
        if (!loading && !disabled) {
          event.currentTarget.style.backgroundColor = ds.color.primaryHover
          event.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(event) => {
        if (!loading && !disabled) {
          event.currentTarget.style.backgroundColor = ds.color.primary
          event.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
    </button>
  )
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, text: '', color: '#E5E7EB', requirements: [] }
    
    const requirements = []
    let strength = 0
    
    // Longueur
    if (pwd.length >= PASSWORD_REQUIREMENTS.minLength) {
      strength++
    } else {
      requirements.push(`Au moins ${PASSWORD_REQUIREMENTS.minLength} caractères`)
    }
    
    // Bonus pour longueur supérieure
    if (pwd.length >= 12) strength++
    
    // Majuscules
    if (PASSWORD_REQUIREMENTS.requireUppercase && /[A-Z]/.test(pwd)) {
      strength++
    } else if (PASSWORD_REQUIREMENTS.requireUppercase) {
      requirements.push('Une majuscule')
    }
    
    // Minuscules
    if (PASSWORD_REQUIREMENTS.requireLowercase && /[a-z]/.test(pwd)) {
      strength++
    } else if (PASSWORD_REQUIREMENTS.requireLowercase) {
      requirements.push('Une minuscule')
    }
    
    // Chiffres
    if (PASSWORD_REQUIREMENTS.requireNumbers && /\d/.test(pwd)) {
      strength++
    } else if (PASSWORD_REQUIREMENTS.requireNumbers) {
      requirements.push('Un chiffre')
    }
    
    // Caractères spéciaux
    if (PASSWORD_REQUIREMENTS.requireSpecialChars && /[^a-zA-Z\d]/.test(pwd)) {
      strength++
    } else if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
      requirements.push('Un caractère spécial')
    }

    const levels = [
      { strength: 0, text: 'Très faible', color: '#DC2626' },
      { strength: 1, text: 'Faible', color: '#F97316' },
      { strength: 2, text: 'Moyen', color: '#EAB308' },
      { strength: 3, text: 'Fort', color: '#22C55E' },
      { strength: 4, text: 'Très fort', color: '#16A34A' },
      { strength: 5, text: 'Excellent', color: '#059669' },
    ]

    return { ...levels[Math.min(strength, 5)], requirements }
  }

  const { strength, text, color, requirements } = getStrength(password)

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className="h-1.5 flex-1 rounded-full transition-all duration-500 ease-out"
            style={{
              backgroundColor: level <= strength ? color : '#E5E7EB',
              transform: level <= strength ? 'scaleY(1)' : 'scaleY(0.5)',
            }}
          />
        ))}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium transition-all duration-300" style={{ color }}>
          Force du mot de passe : {text}
        </p>
        {requirements.length > 0 && (
          <div className="space-y-1">
            {requirements.map((req, index) => (
              <p key={index} className="text-xs" style={{ color: ds.color.textMuted }}>
                • {req}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)
  const [attempts, setAttempts] = useState<{ timestamp: number }[]>([])
  const router = useSafeRouter()
  
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  // Validation améliorée du mot de passe
  const validatePassword = (pwd: string): string => {
    if (!pwd) return 'Mot de passe requis'
    
    const trimmedPwd = pwd.trim()
    
    // Vérifier mots de passe communs
    if (COMMON_PASSWORDS.includes(trimmedPwd.toLowerCase())) {
      return 'Ce mot de passe est trop courant. Choisissez-en un plus sécurisé.'
    }
    
    // Longueur
    if (trimmedPwd.length < PASSWORD_REQUIREMENTS.minLength) {
      return `Le mot de passe doit contenir au moins ${PASSWORD_REQUIREMENTS.minLength} caractères.`
    }
    
    // Majuscule
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(trimmedPwd)) {
      return 'Le mot de passe doit contenir au moins une majuscule.'
    }
    
    // Minuscule
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(trimmedPwd)) {
      return 'Le mot de passe doit contenir au moins une minuscule.'
    }
    
    // Chiffres
    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(trimmedPwd)) {
      return 'Le mot de passe doit contenir au moins un chiffre.'
    }
    
    // Caractères spéciaux
    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[^a-zA-Z\d]/.test(trimmedPwd)) {
      return 'Le mot de passe doit contenir au moins un caractère spécial.'
    }
    
    return ''
  }

  const validateConfirmPassword = (pwd: string, confirmPwd: string): string => {
    if (!confirmPwd) return 'Confirmation requise'
    if (pwd !== confirmPwd) return 'Les mots de passe ne correspondent pas.'
    return ''
  }

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

  const passwordError = validatePassword(password)
  const confirmPasswordError = validateConfirmPassword(password, confirmPassword)

  // Vérifier les paramètres d'erreur dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlError = urlParams.get('error')
    
    if (urlError === 'invalid_token') {
      setIsValidToken(false)
      setError('Ce lien de réinitialisation a expiré ou n\'est pas valide.')
    } else if (urlError === 'missing_code') {
      setIsValidToken(false)
      setError('Lien de réinitialisation invalide.')
    }
  }, [])

  useEffect(() => {
    const checkToken = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getUser()
        
        if (error || !data.user) {
          setIsValidToken(false)
        }
      } catch {
        setIsValidToken(false)
      }
    }

    checkToken()
  }, [])

  const handleResetPassword = useCallback(async () => {
    const pwdError = validatePassword(password)
    const confirmPwdError = validateConfirmPassword(password, confirmPassword)
    
    if (pwdError) {
      setError(pwdError)
      passwordInputRef.current?.focus()
      return
    }
    
    if (confirmPwdError) {
      setError(confirmPwdError)
      confirmPasswordInputRef.current?.focus()
      return
    }

    // Rate limiting check
    if (!checkRateLimit()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      })

      if (updateError) {
        if (updateError.message?.includes('weak password')) {
          setError('Ce mot de passe est trop faible. Choisissez-en un plus sécurisé.')
        } else if (updateError.message?.includes('token')) {
          setError('La session a expiré. Veuillez demander un nouveau lien.')
        } else {
          setError('Erreur serveur. Veuillez réessayer plus tard.')
        }
        setAttempts(prev => [...prev, { timestamp: Date.now() }])
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      
      setTimeout(() => {
        router.redirect('/login')
      }, 3000)
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
      setAttempts(prev => [...prev, { timestamp: Date.now() }])
      setLoading(false)
    }
  }, [password, confirmPassword, router, attempts])

  if (!isValidToken) {
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
              <div 
                className="rounded-2xl p-4 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: ds.color.textPrimary }}>
              Lien invalide
            </h1>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: ds.color.textMuted }}>
              Ce lien de réinitialisation a expiré ou n'est pas valide.<br/>
              Veuillez demander un nouveau lien.
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
            <Link
              href="/forgot-password"
              className="block w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-center transition-colors"
              style={{
                backgroundColor: ds.color.primary,
                color: 'white',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor = ds.color.primaryHover
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = ds.color.primary
              }}
            >
              Demander un nouveau lien
            </Link>
          </section>
        </div>
      </main>
    )
  }

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
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: ds.color.textPrimary }}>
              Mot de passe mis à jour !
            </h1>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: ds.color.textMuted }}>
              Votre mot de passe a été changé avec succès.<br/>
              Vous allez être redirigé vers la page de connexion...
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
              <p className="font-medium mb-2">✅ Succès</p>
              <p className="text-xs leading-relaxed">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
            </div>
          </section>

          <footer className="mt-8 text-center">
            <Link href="/login" className="text-sm font-medium hover:underline transition-all duration-200" style={{ color: ds.color.primary }}>
              Retour à la connexion
            </Link>
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
        <header className="mb-10 text-center sm:mb-12 animate-fade-in">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div 
                className="rounded-2xl p-4 shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-105"
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
          <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ color: ds.color.textPrimary }}>
            Nouveau mot de passe
          </h1>
          <p className="mt-6 text-base leading-relaxed" style={{ color: ds.color.textMuted }}>
            Choisissez votre nouveau mot de passe.<br/>
            Assurez-vous qu'il soit sécurisé et facile à retenir.
          </p>
        </header>

        <section
          className="rounded-2xl border p-6 sm:p-8 transition-all duration-300"
          style={{
            backgroundColor: ds.color.card,
            borderColor: ds.color.border,
            boxShadow: ds.shadow.card,
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.boxShadow = ds.shadow.cardHover
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.boxShadow = ds.shadow.card
          }}
        >
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              void handleResetPassword()
            }}
          >
            <Field
              label="Nouveau mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete="new-password"
              error={passwordError}
              showPasswordToggle
              onPasswordToggle={() => setShowPassword(!showPassword)}
              fieldId="password-input"
            />

            {password && (
              <PasswordStrengthIndicator password={password} />
            )}

            <Field
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              autoComplete="new-password"
              error={confirmPasswordError}
              showPasswordToggle
              onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              fieldId="confirm-password-input"
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

            <PrimaryButton 
              loading={loading} 
              disabled={!!passwordError || !!confirmPasswordError || !password || !confirmPassword}
            />
          </form>
        </section>

        <footer className="mt-6 text-center">
          <Link href="/login" className="text-sm font-medium" style={{ color: ds.color.primary }}>
            Retour à la connexion
          </Link>
        </footer>
      </div>
    </main>
  )
}
