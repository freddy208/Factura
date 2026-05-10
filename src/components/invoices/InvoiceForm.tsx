'use client'
import { useState, useEffect } from 'react'
import { useSafeRouter } from '@/hooks/useRouter'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Item = {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

type Client = {
  id: string
  name: string
  company: string | null
}

type InvoiceFormProps = {
  type: 'invoice' | 'quote'
  defaultClientId?: string
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export default function InvoiceForm({ type, defaultClientId }: InvoiceFormProps) {
  const router = useSafeRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState(defaultClientId || '')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [taxRate, setTaxRate] = useState(0)
  const [currency, setCurrency] = useState('XAF')
  const [items, setItems] = useState<Item[]>([
    { id: generateId(), description: '', quantity: 1, unit_price: 0, total: 0 }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isInvoice = type === 'invoice'
  const label = isInvoice ? 'facture' : 'devis'
  const backHref = isInvoice ? '/factures' : '/devis'

  useEffect(() => {
    async function loadClients() {
      const supabase = createClient()
      const { data } = await supabase
        .from('clients')
        .select('id, name, company')
        .order('name')
      setClients((data as Client[]) || [])
    }
    loadClients()
  }, [])

  function updateItem(id: string, field: keyof Item, value: string | number) {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      if (field === 'quantity' || field === 'unit_price') {
        updated.total = Number(updated.quantity) * Number(updated.unit_price)
      }
      return updated
    }))
  }

  function addItem() {
    setItems(prev => [
      ...prev,
      { id: generateId(), description: '', quantity: 1, unit_price: 0, total: 0 }
    ])
  }

  function removeItem(id: string) {
    if (items.length === 1) return
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  function formatNum(n: number) {
    return new Intl.NumberFormat('fr-FR').format(n)
  }

  async function handleSubmit() {
    const validItems = items.filter(i => i.description.trim())
    if (validItems.length === 0) {
      setError('Ajoutez au moins une ligne avec une description')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.redirect('/login'); return }

      const { data: canCreate } = await supabase
        .rpc('check_quota', { p_user_id: user.id, p_type: type } as any)

      if (!canCreate) {
        setError(`Limite de 5 ${label}s/mois atteinte. Passez en Pro pour continuer.`)
        setLoading(false)
        return
      }

      const { data: number } = await supabase
        .rpc('generate_invoice_number', { p_user_id: user.id, p_type: type } as any)

      const { data: invoice, error: insertError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: selectedClient || null,
          type,
          number: number || `${isInvoice ? 'FACT' : 'DEV'}-0001`,
          status: 'draft',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: dueDate || null,
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
          notes: notes.trim() || null,
          currency,
        } as any)
        .select()
        .single()

      if (insertError || !invoice) {
        setError(insertError?.message || 'Erreur lors de la création')
        setLoading(false)
        return
      }

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(
          validItems.map((item, index) => ({
            invoice_id: (invoice as any).id,
            description: item.description.trim(),
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            total: item.total,
            position: index,
          })) as any
        )

      if (itemsError) {
        setError(itemsError.message)
        setLoading(false)
        return
      }

      router.redirect(`/${backHref.slice(1)}/${(invoice as any).id}`)

    } catch (err) {
      setError('Erreur inattendue. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto pb-24 sm:pb-8">

      {/* Header premium */}
      <section className="rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 shadow-sm sm:p-6 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            className="p-2.5 hover:bg-indigo-100 rounded-xl transition-all duration-200 text-slate-500 hover:text-indigo-600 group"
          >
            <ArrowLeft size={20} className="group-hover:scale-110 transition-transform" />
          </Link>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-1">Création</p>
            <h1 className="text-2xl font-bold text-slate-900 capitalize sm:text-3xl">
              Nouveau {label}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Remplissez les informations ci-dessous pour créer votre {label}</p>
          </div>
        </div>
      </section>

      <div className="space-y-6">

        {/* ── Bloc 1 : Infos générales ── */}
        <section className="bg-white rounded-2xl border border-indigo-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
            <h2 className="font-semibold text-slate-900 text-lg">Informations générales</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Client
              </label>
              <select
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-all bg-gradient-to-b from-white to-slate-50"
              >
                <option value="">Sélectionner un client (optionnel)</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}{client.company ? ` — ${client.company}` : ''}
                  </option>
                ))}
              </select>
              <Link
                href="/clients/nouveau"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1.5 inline-flex items-center gap-1 transition-colors"
              >
                <Plus size={12} />
                Créer un nouveau client
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Date d&apos;échéance
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all bg-gradient-to-b from-white to-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Devise
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all bg-gradient-to-b from-white to-slate-50"
                >
                  <option value="XAF">FCFA (XAF)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar (USD)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bloc 2 : Lignes ── */}
        <section className="bg-white rounded-2xl border border-indigo-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
            <h2 className="font-semibold text-slate-900 text-lg">Prestations / Produits</h2>
          </div>

          {/* En-têtes colonnes */}
          <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-semibold
                          text-slate-400 uppercase tracking-wide px-1 mb-3">
            <span className="col-span-5">Description</span>
            <span className="col-span-2 text-center">Qté</span>
            <span className="col-span-3 text-right">Prix unit.</span>
            <span className="col-span-2 text-right">Total</span>
          </div>

          {/* Lignes items */}
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center group" style={{ animationDelay: `${index * 50}ms` }}>
                <input
                  className="col-span-12 sm:col-span-5 px-3 py-2.5 rounded-xl border
                             border-slate-200 text-sm text-slate-900 placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all bg-gradient-to-b from-white to-slate-50 group-hover:shadow-md"
                  type="text"
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Description de la prestation"
                />
                <input
                  className="col-span-4 sm:col-span-2 px-3 py-2.5 rounded-xl border
                             border-slate-200 text-sm text-center text-slate-900
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all bg-gradient-to-b from-white to-slate-50 group-hover:shadow-md"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                />
                <input
                  className="col-span-5 sm:col-span-3 px-3 py-2.5 rounded-xl border
                             border-slate-200 text-sm text-right text-slate-900
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all bg-gradient-to-b from-white to-slate-50 group-hover:shadow-md"
                  type="number"
                  min="0"
                  value={item.unit_price}
                  onChange={e => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
                <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                  <span className="hidden sm:block text-sm font-semibold text-slate-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formatNum(item.total)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="p-1.5 text-slate-300 hover:text-red-500 disabled:opacity-30
                               transition-all rounded-lg flex-shrink-0 hover:bg-red-50 group-hover:scale-110"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton ajouter ligne */}
          <button
            onClick={addItem}
            className="mt-4 flex items-center gap-2 text-indigo-600 text-sm font-semibold
                       hover:text-indigo-700 transition-all duration-200 group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
            Ajouter une ligne
          </button>
        </section>

        {/* ── Bloc 3 : Notes + Totaux ── */}
        <section className="bg-white rounded-2xl border border-indigo-200/50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6">

            {/* Notes */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
                <label className="block text-sm font-semibold text-slate-700">
                  Notes (optionnel)
                </label>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Conditions de paiement, coordonnées bancaires..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                           placeholder-slate-400 focus:outline-none focus:ring-2
                           focus:ring-indigo-500 focus:border-indigo-500 transition-all
                           resize-none text-sm bg-gradient-to-b from-white to-slate-50"
              />
            </div>

            {/* Totaux */}
            <div className="sm:w-52 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
                  <label className="block text-sm font-semibold text-slate-700">
                    TVA (%)
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200
                             text-slate-900 focus:outline-none focus:ring-2
                             focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm bg-gradient-to-b from-white to-slate-50"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 bg-gradient-to-b from-slate-50 to-white rounded-xl p-3 -mx-3">
                <div className="flex justify-between text-sm text-slate-500 group">
                  <span className="font-medium">Sous-total</span>
                  <span className="font-semibold text-slate-700">{formatNum(subtotal)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm text-slate-500 group">
                    <span className="font-medium">TVA ({taxRate}%)</span>
                    <span className="font-semibold text-slate-700">{formatNum(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900
                                pt-2 border-t-2 border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 -mx-3 px-3 py-2 rounded-lg">
                  <span className="text-lg">Total</span>
                  <span className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formatNum(total)} {currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Erreur */}
        {error && (
          <section className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 text-red-700 text-sm
                          px-4 py-3 rounded-xl shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span>{error}</span>
              {error.includes('Limite') && (
                <Link href="/upgrade" className="underline font-medium text-red-800 hover:text-red-900 transition-colors">
                  Passer en Pro
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Link
            href={backHref}
            className="flex-1 text-center border border-slate-200 text-slate-600
                       font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
          >
            <span className="group-hover:scale-105 inline-block transition-transform">Annuler</span>
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed
                       text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
              </span>
            ) : (
              <span>Créer le {label}</span>
            )}
          </button>
        </div>

      </div>
    </main>
  )
}