'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSafeRouter } from '@/hooks/useRouter'
import { createClient } from '@/lib/supabase/client'
import { sendWelcomeEmailAction } from '@/app/actions/email'
import { validateName, validateEmail, validateCompany } from '@/lib/validation'

const ds = {
  color: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E5E7EB',
    borderFocus: '#2563EB',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    success: '#22C55E',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
  },
  shadow: {
    card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 30px rgba(15, 23, 42, 0.06)',
  },
  font: {
    sans: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
} as const

type RegisterForm = {
  full_name: string
  company_name: string
  email: string
  password: string
}

type FieldProps = {
  label: string
  type?: string
  value: string
  placeholder: string
  autoComplete?: string
  error?: string
  onChange: (value: string) => void
  showPasswordToggle?: boolean
  onPasswordToggle?: () => void
}

function Field({
  label,
  type = 'text',
  value,
  placeholder,
  autoComplete,
  error,
  onChange,
  showPasswordToggle,
  onPasswordToggle,
}: FieldProps) {
  const fieldId = label.toLowerCase().replace(/\s+/g, '-')
  const errorId = error ? `${fieldId}-error` : undefined
  
  return (
    <div className="space-y-2.5">
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium" 
        style={{ color: ds.color.textSecondary }}
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
          aria-describedby={errorId}
          className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors pr-12"
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
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onPasswordToggle}
            aria-label={type === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            style={{ color: ds.color.textMuted }}
          >
            {type === 'password' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
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

function PrimaryButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      style={{ backgroundColor: ds.color.primary }}
      onMouseEnter={(event) => {
        if (!loading) event.currentTarget.style.backgroundColor = ds.color.primaryHover
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = ds.color.primary
      }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg 
            className="animate-spin h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Création du compte...
        </span>
      ) : 'Créer mon compte'}
    </button>
  )
}

function GoogleButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        const supabase = createClient()
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })
      }}
      className="w-full rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-3"
      style={{
        backgroundColor: ds.color.card,
        borderColor: ds.color.border,
        color: ds.color.textPrimary,
      }}
      onMouseEnter={(event) => {
        if (!loading) {
          event.currentTarget.style.borderColor = ds.color.borderFocus
          event.currentTarget.style.backgroundColor = '#F8FAFC'
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = ds.color.border
        event.currentTarget.style.backgroundColor = ds.color.card
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {loading ? 'Connexion...' : 'Continuer avec Google'}
    </button>
  )
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    full_name: '',
    company_name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useSafeRouter()

  const fieldErrors = useMemo(() => {
    const nameValidation = validateName(form.full_name)
    const emailValidation = validateEmail(form.email)
    const companyValidation = validateCompany(form.company_name)
    
    return {
      full_name: error && !nameValidation.isValid ? nameValidation.error || 'Nom invalide' : '',
      company_name: error && !companyValidation.isValid ? companyValidation.error || 'Entreprise invalide' : '',
      email: error && !emailValidation.isValid ? emailValidation.error || 'Email invalide' : '',
      password: error && form.password.length < 8 ? '8 caractères minimum' : '',
    }
  }, [error, form.full_name, form.email, form.company_name, form.password])

  const setField = useCallback((key: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleRegister = useCallback(async () => {
    // Validation avancée avec sanitization
    const nameValidation = validateName(form.full_name)
    const emailValidation = validateEmail(form.email)
    const companyValidation = validateCompany(form.company_name)
    
    if (!nameValidation.isValid || !emailValidation.isValid || !companyValidation.isValid || form.password.length < 8) {
      const errors = [
        !nameValidation.isValid && nameValidation.error,
        !emailValidation.isValid && emailValidation.error,
        !companyValidation.isValid && companyValidation.error,
        form.password.length < 8 && 'Le mot de passe doit contenir 8 caractères minimum'
      ].filter(Boolean)
      
      setError(errors.join('. '))
      return
    }

    // Utiliser les valeurs validées et sanitizées
    const fullName = nameValidation.sanitized
    const companyName = companyValidation.sanitized
    const email = emailValidation.sanitized

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      })

      if (signInError || !signInData.user) {
        setError(signInError?.message ?? 'Impossible de vous connecter après inscription.')
        setLoading(false)
        return
      }

      const { error: profileError } = await (supabase.from('profiles') as any)
        .update({
          full_name: fullName,
          company_name: companyName,
        })
        .eq('id', signInData.user.id)

      if (profileError) {
        setError('Compte cree, mais le profil n a pas ete finalise. Veuillez reessayer.')
        setLoading(false)
        return
      }

      const welcomeResult = await sendWelcomeEmailAction(
        form.email.trim(),
        form.full_name.trim() || form.company_name.trim()
      )
      if (!welcomeResult.ok) {
        console.error('Email bienvenue:', welcomeResult.error)
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', signInData.user.id)
        .single()

      const profile = profileData as { onboarding_done: boolean } | null
      router.redirect(profile?.onboarding_done ? '/dashboard' : '/onboarding')
    } catch {
      setError('Erreur inattendue. Veuillez reessayer.')
      setLoading(false)
    }
  }, [form])

  return (
    <main
      className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:py-10"
      style={{
        backgroundColor: ds.color.bg,
        fontFamily: ds.font.sans,
      }}
    >
      <div className="mx-auto w-full max-w-md">
        <header className="mb-6 text-center sm:mb-8 lg:mb-10">
          <div className="mb-3 inline-flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-semibold tracking-wide sm:mb-4">
            <span style={{ color: ds.color.primary }}>Factura</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: ds.color.textPrimary }}>
            Créer votre compte
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: ds.color.textMuted }}>
            Lancez votre espace de facturation en moins de deux minutes.
          </p>
        </header>

        <section
          className="rounded-2xl border p-4 sm:p-5 lg:p-7"
          style={{
            backgroundColor: ds.color.card,
            borderColor: ds.color.border,
            boxShadow: ds.shadow.card,
          }}
        >
          <form
            className="space-y-4 sm:space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              void handleRegister()
            }}
            noValidate
          >
            <Field
              label="Nom complet"
              value={form.full_name}
              onChange={(value) => setField('full_name', value)}
              placeholder="Jean Dupont"
              autoComplete="name"
              error={fieldErrors.full_name}
            />

            <Field
              label="Entreprise"
              value={form.company_name}
              onChange={(value) => setField('company_name', value)}
              placeholder="Mon Entreprise SARL"
              autoComplete="organization"
              error={fieldErrors.company_name}
            />

            <Field
              label="Email professionnel"
              type="email"
              value={form.email}
              onChange={(value) => setField('email', value)}
              placeholder="vous@entreprise.com"
              autoComplete="email"
              error={fieldErrors.email}
            />

            <Field
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(value) => setField('password', value)}
              placeholder="8 caracteres minimum"
              autoComplete="new-password"
              error={fieldErrors.password}
              showPasswordToggle
              onPasswordToggle={() => setShowPassword(!showPassword)}
            />

            <div className="rounded-xl border px-3 py-2.5 text-xs sm:px-4 sm:py-3" style={{ borderColor: '#DBEAFE', color: ds.color.textMuted }}>
              <div className="flex items-start gap-2">
                <svg 
                  className="w-4 h-4 mt-0.5 flex-shrink-0" 
                  style={{ color: '#3B82F6' }}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  Mot de passe recommandé: 12 caractères, lettres et chiffres.
                </span>
              </div>
            </div>

            {error ? (
              <div
                className="rounded-xl border px-3 py-2.5 text-sm sm:px-4 sm:py-3"
                role="alert"
                aria-live="polite"
                style={{
                  backgroundColor: ds.color.dangerBg,
                  borderColor: '#FECACA',
                  color: ds.color.danger,
                }}
              >
                <div className="flex items-start gap-2">
                  <svg 
                    className="w-4 h-4 mt-0.5 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            ) : null}

            <PrimaryButton loading={loading} />
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: ds.color.border }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{ backgroundColor: ds.color.bg, color: ds.color.textMuted }}>
                Ou continuer avec
              </span>
            </div>
          </div>

          <GoogleButton loading={loading} />
        </section>

        <footer className="mt-6 space-y-3 text-center sm:mt-8">
          <p className="text-sm" style={{ color: ds.color.textMuted }}>
            Déjà un compte ?{' '}
            <Link 
              href="/login" 
              className="font-medium hover:underline transition-colors" 
              style={{ color: ds.color.primary }}
            >
              Se connecter
            </Link>
          </p>
          <p className="text-xs leading-relaxed" style={{ color: ds.color.textMuted }}>
            En continuant, vous acceptez les{' '}
            <Link 
              href="/conditions" 
              className="underline hover:no-underline transition-colors"
              style={{ color: ds.color.primary }}
            >
              conditions d'utilisation
            </Link>
            {' '}de Factura.
          </p>
        </footer>
      </div>
    </main>
  )
}
