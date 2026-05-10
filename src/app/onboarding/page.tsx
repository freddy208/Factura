'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const companyTypes = [
  {
    value: 'freelance',
    label: 'Freelance',
    description: 'Simple, rapide, parfait pour une activite en solo.',
  },
  {
    value: 'pme',
    label: 'PME',
    description: 'Un cadre clair pour vos clients et votre equipe.',
  },
  {
    value: 'agence',
    label: 'Agence',
    description: 'Multi-clients, multi-projets, zero confusion.',
  },
] as const

const ds = {
  color: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    primary: '#2563EB',
    indigo: '#6366F1',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    success: '#22C55E',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
  },
  shadow: {
    soft: '0 1px 2px rgba(15,23,42,0.04), 0 10px 30px rgba(15,23,42,0.06)',
    focus: '0 0 0 3px rgba(37,99,235,0.12)',
  },
  font: {
    sans: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
} as const

type Step = 1 | 2

type FormState = {
  company_type: string
  phone: string
  address: string
}

function stepText(step: Step) {
  return step === 1 ? 'Identite de votre activite' : 'Coordonnees de facturation'
}

function Stepper({ step }: { step: Step }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide">
        <span style={{ color: ds.color.textMuted }}>Etape {step} / 2</span>
        <span style={{ color: ds.color.primary }}>{stepText(step)}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{
              backgroundColor: item <= step ? ds.color.primary : '#E2E8F0',
              transform: item === step ? 'scaleY(1.1)' : 'scaleY(1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function FacturePreview({ form }: { form: FormState }) {
  const profileLabel =
    companyTypes.find((item) => item.value === form.company_type)?.label ?? 'Votre profil'

  return (
    <div
      className="rounded-2xl border p-4 transition-all duration-300"
      style={{
        borderColor: '#BFDBFE',
        background: 'linear-gradient(145deg, rgba(37,99,235,0.08) 0%, rgba(99,102,241,0.10) 100%)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: ds.color.primary }}>
        Apercu de votre premiere facture
      </p>

      <div className="mt-3 rounded-xl border bg-white p-4" style={{ borderColor: ds.color.border, boxShadow: ds.shadow.soft }}>
        <div className="mb-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 animate-pulse" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: ds.color.textPrimary }}>
              Factura
            </p>
            <p className="text-[11px]" style={{ color: ds.color.textMuted }}>
              Facture #FA-0001
            </p>
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: '#ECFDF3', color: '#15803D' }}
          >
            Brouillon
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg border px-2.5 py-2" style={{ borderColor: ds.color.border }}>
            <p style={{ color: ds.color.textMuted }}>Client</p>
            <p className="mt-1 font-medium" style={{ color: ds.color.textPrimary }}>
              Entreprise Demo
            </p>
          </div>
          <div className="rounded-lg border px-2.5 py-2 text-right" style={{ borderColor: ds.color.border }}>
            <p style={{ color: ds.color.textMuted }}>Total</p>
            <p className="mt-1 font-semibold" style={{ color: ds.color.textPrimary }}>
              120 000 FCFA
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 text-xs leading-relaxed" style={{ color: ds.color.textSecondary }}>
          <p>
            Profil: <span className="font-medium" style={{ color: ds.color.textPrimary }}>{profileLabel}</span>
          </p>
          <p>
            Telephone: <span className="font-medium" style={{ color: ds.color.textPrimary }}>{form.phone.trim() || 'Non renseigne'}</span>
          </p>
          <p>
            Adresse: <span className="font-medium" style={{ color: ds.color.textPrimary }}>{form.address.trim() || 'Non renseignee'}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

type InputProps = {
  label: string
  value: string
  placeholder: string
  type?: string
  onChange: (value: string) => void
}

function InputField({ label, value, placeholder, type = 'text', onChange }: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-medium" style={{ color: ds.color.textSecondary }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-3 text-[14px] outline-none transition-all sm:text-[15px]"
        style={{ borderColor: ds.color.border, color: ds.color.textPrimary }}
        onFocus={(event) => {
          event.currentTarget.style.borderColor = ds.color.primary
          event.currentTarget.style.boxShadow = ds.shadow.focus
        }}
        onBlur={(event) => {
          event.currentTarget.style.borderColor = ds.color.border
          event.currentTarget.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>({
    company_type: '',
    phone: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const canContinue = useMemo(() => form.company_type.length > 0, [form.company_type])
  const selectedTypeLabel = useMemo(
    () => companyTypes.find((item) => item.value === form.company_type)?.label ?? 'A definir',
    [form.company_type]
  )

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleFinish() {
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('Session invalide. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }

      const { error: updateError } = await (supabase.from('profiles') as any)
        .update({
          company_type: form.company_type,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          onboarding_done: true,
        })
        .eq('id', user.id)

      if (updateError) {
        setError('Impossible de finaliser pour le moment. Veuillez reessayer.')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Une erreur inattendue est survenue. Veuillez reessayer.')
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen px-3 py-6 sm:px-6 sm:py-10"
      style={{ backgroundColor: ds.color.bg, fontFamily: ds.font.sans }}
    >
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 text-center sm:mb-8">
          <div className="mb-4 inline-flex items-center justify-center rounded-xl border px-3 py-1.5 text-[11px] font-semibold tracking-wide">
            <span style={{ color: ds.color.primary }}>Factura Onboarding</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl" style={{ color: ds.color.textPrimary }}>
            Construisons votre espace de facturation
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-[13px] leading-relaxed sm:text-sm" style={{ color: ds.color.textMuted }}>
            Quelques informations simples pour une interface claire, credible et prete a envoyer votre premiere facture.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section
            className="rounded-2xl border bg-white p-4 sm:p-7"
            style={{ borderColor: ds.color.border, boxShadow: ds.shadow.soft }}
          >
            <Stepper step={step} />

            {step === 1 ? (
              <div className="motion-enter">
                <h2 className="text-xl font-semibold sm:text-2xl" style={{ color: ds.color.textPrimary }}>
                  Quel est votre cadre de travail ?
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed sm:text-sm" style={{ color: ds.color.textMuted }}>
                  Ce choix adapte automatiquement les textes et l organisation de vos documents.
                </p>

                <div className="mt-5 space-y-3">
                  {companyTypes.map((item, index) => {
                    const selected = form.company_type === item.value
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => updateForm('company_type', item.value)}
                        className="w-full rounded-xl border p-3.5 text-left transition-all duration-200 active:scale-[0.99] sm:p-4"
                        style={{
                          borderColor: selected ? ds.color.primary : ds.color.border,
                          backgroundColor: selected ? '#EFF6FF' : ds.color.card,
                          boxShadow: selected ? '0 0 0 1px rgba(37,99,235,0.15)' : 'none',
                          animation: `cardIn 260ms ease-out ${index * 60}ms both`,
                        }}
                      >
                        <p className="text-[13px] font-semibold sm:text-sm" style={{ color: ds.color.textPrimary }}>
                          {item.label}
                        </p>
                        <p className="mt-1 text-[12px] leading-relaxed sm:text-sm" style={{ color: ds.color.textMuted }}>
                          {item.description}
                        </p>
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep(2)}
                  className="mt-6 w-full rounded-xl px-4 py-3.5 text-[13px] font-semibold text-white transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                  style={{ background: `linear-gradient(90deg, ${ds.color.primary} 0%, ${ds.color.indigo} 100%)` }}
                >
                  Continuer
                </button>
              </div>
            ) : (
              <div className="motion-enter">
                <h2 className="text-xl font-semibold sm:text-2xl" style={{ color: ds.color.textPrimary }}>
                  Vos coordonnees professionnelles
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed sm:text-sm" style={{ color: ds.color.textMuted }}>
                  Ces informations apparaissent sur vos factures pour renforcer votre credibilite.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium" style={{ borderColor: '#DBEAFE', backgroundColor: '#EFF6FF', color: ds.color.primary }}>
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: ds.color.success }} />
                  Profil actif: {selectedTypeLabel}
                </div>

                <div className="mt-5 space-y-4">
                  <InputField
                    label="Telephone (optionnel)"
                    value={form.phone}
                    onChange={(value) => updateForm('phone', value)}
                    placeholder="+237 6XX XXX XXX"
                    type="tel"
                  />
                  <InputField
                    label="Adresse (optionnel)"
                    value={form.address}
                    onChange={(value) => updateForm('address', value)}
                    placeholder="Douala, Cameroun"
                  />
                </div>

                {error ? (
                  <div
                    className="mt-5 rounded-xl border px-4 py-3 text-sm"
                    style={{ backgroundColor: ds.color.dangerBg, borderColor: '#FECACA', color: ds.color.danger }}
                  >
                    {error}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full rounded-xl border px-4 py-3.5 text-[13px] font-medium transition-all duration-200 active:scale-[0.99] sm:w-1/2 sm:text-sm"
                    style={{ borderColor: ds.color.border, color: ds.color.textSecondary }}
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleFinish}
                    className="w-full rounded-xl px-4 py-3.5 text-[13px] font-semibold text-white transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-1/2 sm:text-sm"
                    style={{ background: `linear-gradient(90deg, ${ds.color.primary} 0%, ${ds.color.indigo} 100%)` }}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-30" />
                          <path d="M4 12a8 8 0 018-8V1C5.925 1 1 5.925 1 12h3z" fill="currentColor" />
                        </svg>
                        Finalisation...
                      </span>
                    ) : 'Acceder au dashboard'}
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <FacturePreview form={form} />

            <div className="rounded-2xl border bg-white p-4" style={{ borderColor: ds.color.border, boxShadow: ds.shadow.soft }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: ds.color.success }}>
                Confiance et rapidite
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed" style={{ color: ds.color.textSecondary }}>
                <li>- Interface optimisee mobile et internet faible.</li>
                <li>- Vos donnees sont modifiables a tout moment.</li>
                <li>- Votre dashboard est pret juste apres cette etape.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
      <style jsx>{`
        .motion-enter {
          animation: sectionIn 280ms ease-out both;
        }
        @keyframes sectionIn {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.995);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes cardIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  )
}
