'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSafeRouter } from '@/hooks/useRouter'
import { createClient } from '@/lib/supabase/client'

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
  showPasswordToggle?: boolean
  onPasswordToggle?: () => void
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
}: InputProps) {
  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-medium" style={{ color: ds.color.textSecondary }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
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
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs" style={{ color: ds.color.danger }}>
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
      style={{
        backgroundColor: ds.color.primary,
      }}
      onMouseEnter={(event) => {
        if (!loading) event.currentTarget.style.backgroundColor = ds.color.primaryHover
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = ds.color.primary
      }}
    >
      {loading ? 'Connexion...' : 'Se connecter'}
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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useSafeRouter()

  const emailError = !email.trim() && error ? 'Email requis' : ''
  const passwordError = !password && error ? 'Mot de passe requis' : ''

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      setError('Veuillez saisir votre email et mot de passe.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError || !data.session) {
        setError('Email ou mot de passe incorrect.')
        setLoading(false)
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', data.user.id)
        .single()

      const profile = profileData as { onboarding_done: boolean } | null
      router.redirect(profile && !profile.onboarding_done ? '/onboarding' : '/dashboard')
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.')
      setLoading(false)
    }
  }, [email, password])

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
                  src="/icon-512.png" 
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
              <div 
                className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-green-500 border-2 border-white shadow-md animate-pulse"
              ></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: ds.color.textPrimary }}>
            Factura
          </h1>
          <h2 className="text-2xl font-semibold tracking-tight" style={{ color: ds.color.textSecondary }}>
            Bon retour
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: ds.color.textMuted }}>
            Connectez-vous pour gérer vos factures en toute confiance.<br/>
            <span className="font-medium" style={{ color: ds.color.primary }}>
              Rapide, simple, professionnel.
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
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              void handleLogin()
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
            />

            <Field
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete="current-password"
              error={passwordError}
              showPasswordToggle
              onPasswordToggle={() => setShowPassword(!showPassword)}
            />

            {error ? (
              <div
                className="rounded-xl border px-4 py-3 text-sm"
                style={{
                  backgroundColor: ds.color.dangerBg,
                  borderColor: '#FECACA',
                  color: ds.color.danger,
                }}
              >
                {error}
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

        <footer className="mt-6 space-y-3 text-center">
          <p className="text-sm" style={{ color: ds.color.textMuted }}>
            <Link href="/forgot-password" className="font-medium" style={{ color: ds.color.primary }}>
              Mot de passe oublié ?
            </Link>
          </p>
          <p className="text-sm" style={{ color: ds.color.textMuted }}>
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-medium" style={{ color: ds.color.primary }}>
              Creer un compte
            </Link>
          </p>
          <p className="text-xs" style={{ color: ds.color.textMuted }}>
            Securise, rapide, concu pour les pros.
          </p>
        </footer>
      </div>
    </main>
  )
}
