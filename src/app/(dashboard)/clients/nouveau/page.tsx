'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ClientForm = {
  name: string
  email: string
  phone: string
  company: string
  address: string
}

export default function NouveauClientPage() {
  const [form, setForm] = useState<ClientForm>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
        window.location.href = '/login'
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
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/clients" className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Module Clients</p>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Nouveau client</h1>
          </div>
        </div>
        <p className="text-sm text-slate-500">Une fiche simple et complete pour des factures plus rapides.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Nom complet *</label>
            <input
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="Jean Dupont"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Entreprise</label>
              <input
                value={form.company}
                onChange={(event) => setField('company', event.target.value)}
                placeholder="Mon Entreprise"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
                placeholder="client@entreprise.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Telephone</label>
              <input
                value={form.phone}
                onChange={(event) => setField('phone', event.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Adresse</label>
              <input
                value={form.address}
                onChange={(event) => setField('address', event.target.value)}
                placeholder="Douala, Cameroun"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/clients"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:w-1/2"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-1/2"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
