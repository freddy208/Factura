'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

  const emailError = !email.trim() && error ? 'Email requis' : ''

  const handleResetPassword = useCallback(async () => {
    if (!email.trim()) {
      setError('Veuillez saisir votre email.')
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
        setError('Une erreur est survenue. Veuillez vérifier votre email et réessayer.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }, [email])

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
