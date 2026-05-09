'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
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
}

function Field({
  label,
  type = 'text',
  value,
  placeholder,
  error,
  onChange,
  autoComplete,
}: InputProps) {
  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-medium" style={{ color: ds.color.textSecondary }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      window.location.href = profile && !profile.onboarding_done ? '/onboarding' : '/dashboard'
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
          <div className="mb-4 inline-flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-semibold tracking-wide">
            <span style={{ color: ds.color.primary }}>FACTURA</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: ds.color.textPrimary }}>
            Bon retour
          </h1>
          <p className="mt-2 text-sm" style={{ color: ds.color.textMuted }}>
            Connectez-vous pour gerer vos factures en toute confiance.
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
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete="current-password"
              error={passwordError}
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
        </section>

        <footer className="mt-6 space-y-3 text-center">
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
