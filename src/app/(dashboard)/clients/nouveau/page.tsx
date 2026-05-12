'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSafeRouter } from '@/hooks/useRouter'
import { ArrowLeft, User, Building2, Mail, Phone, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { validateName, validateEmail, validatePhone, validateCompany, validateAddress, RateLimiter } from '@/lib/validation'
import PremiumCard from '@/components/ui/PremiumCard'
import PremiumButton from '@/components/ui/PremiumButton'
import PremiumInput from '@/components/ui/PremiumInput'

type ClientForm = {
  name: string
  email: string
  phone: string
  company: string
  address: string
}

// Rate limiter global pour la création de clients
const clientCreationLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 tentatives par 15 minutes

export default function NouveauClientPage() {
  const router = useSafeRouter()
  const [form, setForm] = useState<ClientForm>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => form.name.trim().length > 0, [form.name])

  function setField(key: keyof ClientForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Vider les erreurs précédentes
    setError('')
    setFieldErrors({})

    // Rate limiting - vérifier avec l'ID utilisateur ou IP
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.redirect('/login')
      return
    }

    if (!clientCreationLimiter.isAllowed(user.id)) {
      const resetTime = clientCreationLimiter.getResetTime(user.id)
      const remainingTime = resetTime ? Math.ceil((resetTime - Date.now()) / 60000) : 15
      setError(`Trop de tentatives. Veuillez réessayer dans ${remainingTime} minutes.`)
      return
    }

    // Validation des champs
    const nameValidation = validateName(form.name)
    if (!nameValidation.isValid) {
      setFieldErrors(prev => ({ ...prev, name: nameValidation.error || 'Nom invalide' }))
      return
    }

    const emailValidation = validateEmail(form.email)
    if (!emailValidation.isValid) {
      setFieldErrors(prev => ({ ...prev, email: emailValidation.error || 'Email invalide' }))
      return
    }

    const phoneValidation = validatePhone(form.phone)
    if (!phoneValidation.isValid) {
      setFieldErrors(prev => ({ ...prev, phone: phoneValidation.error || 'Téléphone invalide' }))
      return
    }

    const companyValidation = validateCompany(form.company)
    if (!companyValidation.isValid) {
      setFieldErrors(prev => ({ ...prev, company: companyValidation.error || 'Entreprise invalide' }))
      return
    }

    const addressValidation = validateAddress(form.address)
    if (!addressValidation.isValid) {
      setFieldErrors(prev => ({ ...prev, address: addressValidation.error || 'Adresse invalide' }))
      return
    }

    setLoading(true)

    try {
      const { error: insertError } = await supabase.from('clients').insert({
        user_id: user.id,
        name: nameValidation.sanitized,
        email: emailValidation.sanitized || null,
        phone: phoneValidation.sanitized || null,
        company: companyValidation.sanitized || null,
        address: addressValidation.sanitized || null,
      } as any)

      if (insertError) {
        setError('Erreur lors de la création du client. Veuillez réessayer.')
        setLoading(false)
        return
      }

      router.push('/clients')
      router.refresh()
    } catch (error) {
      console.error('Erreur inattendue:', error)
      setError('Erreur inattendue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-5 pb-20">
      {/* Header premium */}
      <PremiumCard variant="elevated" padding="lg" hover={false}>
        <div className="flex items-center gap-4">
          <Link href="/clients" className="rounded-xl border border-blue-200/50 p-2.5 text-blue-600 hover:bg-blue-50 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Module Clients</p>
              <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Nouveau client</h1>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">Une fiche simple et complete pour des factures plus rapides.</p>
      </PremiumCard>

      {/* Formulaire premium */}
      <PremiumCard variant="default" padding="lg" hover={false}>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User size={14} className="text-blue-600" />
              Nom complet *
            </label>
            <PremiumInput
              value={form.name}
              onChange={(value) => setField('name', value)}
              placeholder="Jean Dupont"
              required
              error={fieldErrors.name}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Building2 size={14} className="text-blue-600" />
                Entreprise
              </label>
              <PremiumInput
                value={form.company}
                onChange={(value) => setField('company', value)}
                placeholder="Mon Entreprise"
                error={fieldErrors.company}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Mail size={14} className="text-blue-600" />
                Email
              </label>
              <PremiumInput
                type="email"
                value={form.email}
                onChange={(value) => setField('email', value)}
                placeholder="client@entreprise.com"
                error={fieldErrors.email}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Phone size={14} className="text-blue-600" />
                Téléphone
              </label>
              <PremiumInput
                value={form.phone}
                onChange={(value) => setField('phone', value)}
                placeholder="+237 6XX XXX XXX"
                error={fieldErrors.phone}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin size={14} className="text-blue-600" />
                Adresse
              </label>
              <PremiumInput
                value={form.address}
                onChange={(value) => setField('address', value)}
                placeholder="Douala, Cameroun"
                error={fieldErrors.address}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <PremiumButton
              href="/clients"
              variant="secondary"
              size="lg"
              fullWidth
            >
              Annuler
            </PremiumButton>
            <PremiumButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!canSubmit}
              fullWidth
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </PremiumButton>
          </div>
        </form>
      </PremiumCard>
    </main>
  )
}
