'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSafeRouter } from '@/hooks/useRouter'
import { ArrowLeft, User, Building2, Mail, Phone, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => form.name.trim().length > 0, [form.name])

  function setField(key: keyof ClientForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim()) {
      setError('Le nom du client est requis.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.redirect('/login')
        return
      }

      const { error: insertError } = await supabase.from('clients').insert({
        user_id: user.id,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        address: form.address.trim() || null,
      } as any)

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      router.push('/clients')
      router.refresh()
    } catch {
      setError('Erreur inattendue. Veuillez reessayer.')
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
