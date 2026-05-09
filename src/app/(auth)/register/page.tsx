'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

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
}

function Field({
  label,
  type = 'text',
  value,
  placeholder,
  autoComplete,
  error,
  onChange,
}: FieldProps) {
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
      style={{ backgroundColor: ds.color.primary }}
      onMouseEnter={(event) => {
        if (!loading) event.currentTarget.style.backgroundColor = ds.color.primaryHover
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = ds.color.primary
      }}
    >
      {loading ? 'Creation du compte...' : 'Creer mon compte'}
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

  const fieldErrors = useMemo(() => {
    if (!error) {
      return {
        full_name: '',
        company_name: '',
        email: '',
        password: '',
      }
    }

    return {
      full_name: form.full_name.trim() ? '' : 'Nom requis',
      company_name: form.company_name.trim() ? '' : 'Entreprise requise',
      email: form.email.trim() ? '' : 'Email requis',
      password: form.password.length >= 8 ? '' : '8 caracteres minimum',
    }
  }, [error, form.company_name, form.email, form.full_name, form.password])

  const setField = useCallback((key: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleRegister = useCallback(async () => {
    const fullName = form.full_name.trim()
    const companyName = form.company_name.trim()
    const email = form.email.trim()

    if (!fullName || !companyName || !email || form.password.length < 8) {
      setError('Tous les champs sont requis. Le mot de passe doit contenir 8 caracteres minimum.')
      return
    }

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
        setError(signInError?.message ?? 'Impossible de vous connecter apres inscription.')
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

      // Envoyer email de bienvenue
      try {
        await fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.trim(),
            name: form.full_name.trim() || form.company_name.trim(),
          }),
        })
      } catch (emailError) {
        console.error('Erreur envoi email bienvenue:', emailError)
        // Ne pas bloquer l'inscription si l'email échoue
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', signInData.user.id)
        .single()

      const profile = profileData as { onboarding_done: boolean } | null
      window.location.href = profile?.onboarding_done ? '/dashboard' : '/onboarding'
    } catch {
      setError('Erreur inattendue. Veuillez reessayer.')
      setLoading(false)
    }
  }, [form])

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
            Creer votre compte
          </h1>
          <p className="mt-2 text-sm" style={{ color: ds.color.textMuted }}>
            Lancez votre espace de facturation en moins de deux minutes.
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
              void handleRegister()
            }}
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
              type="password"
              value={form.password}
              onChange={(value) => setField('password', value)}
              placeholder="8 caracteres minimum"
              autoComplete="new-password"
              error={fieldErrors.password}
            />

            <div className="rounded-xl border px-4 py-3 text-xs" style={{ borderColor: '#DBEAFE', color: ds.color.textMuted }}>
              Mot de passe recommande: 12 caracteres, lettres et chiffres.
            </div>

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
            Deja un compte ?{' '}
            <Link href="/login" className="font-medium" style={{ color: ds.color.primary }}>
              Se connecter
            </Link>
          </p>
          <p className="text-xs" style={{ color: ds.color.textMuted }}>
            En continuant, vous acceptez les conditions d utilisation de Factura.
          </p>
        </footer>
      </div>
    </main>
  )
}
