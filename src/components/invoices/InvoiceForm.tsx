'use client'
import { useState, useEffect } from 'react'
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
      if (!user) { window.location.href = '/login'; return }

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

      window.location.href = `/${backHref.slice(1)}/${(invoice as any).id}`

    } catch (err) {
      setError('Erreur inattendue. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={backHref}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            Nouveau {label}
          </h1>
          <p className="text-gray-500 text-sm">Remplissez les informations ci-dessous</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── Bloc 1 : Infos générales ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Informations générales</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Client
            </label>
            <select
              value={selectedClient}
              onChange={e => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent transition-all bg-white"
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
              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
            >
              + Créer un nouveau client
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date d&apos;échéance
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Devise
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition-all bg-white"
              >
                <option value="XAF">FCFA (XAF)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dollar (USD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Bloc 2 : Lignes ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Prestations / Produits</h2>

          {/* En-têtes colonnes */}
          <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-medium
                          text-gray-400 uppercase tracking-wide px-1 mb-2">
            <span className="col-span-5">Description</span>
            <span className="col-span-2 text-center">Qté</span>
            <span className="col-span-3 text-right">Prix unit.</span>
            <span className="col-span-2 text-right">Total</span>
          </div>

          {/* Lignes items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  className="col-span-12 sm:col-span-5 px-3 py-2.5 rounded-xl border
                             border-gray-200 text-sm text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent transition-all"
                  type="text"
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Description de la prestation"
                />
                <input
                  className="col-span-4 sm:col-span-2 px-3 py-2.5 rounded-xl border
                             border-gray-200 text-sm text-center text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent transition-all"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                />
                <input
                  className="col-span-5 sm:col-span-3 px-3 py-2.5 rounded-xl border
                             border-gray-200 text-sm text-right text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent transition-all"
                  type="number"
                  min="0"
                  value={item.unit_price}
                  onChange={e => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
                <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                  <span className="hidden sm:block text-sm font-semibold text-gray-900">
                    {formatNum(item.total)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="p-1.5 text-gray-300 hover:text-red-500 disabled:opacity-30
                               transition-all rounded-lg flex-shrink-0"
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
            className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-medium
                       hover:text-blue-700 transition-all"
          >
            <Plus size={16} />
            Ajouter une ligne
          </button>
        </div>

        {/* ── Bloc 3 : Notes + Totaux ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-6">

            {/* Notes */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Conditions de paiement, coordonnées bancaires..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900
                           placeholder-gray-400 focus:outline-none focus:ring-2
                           focus:ring-blue-500 focus:border-transparent transition-all
                           resize-none text-sm"
              />
            </div>

            {/* Totaux */}
            <div className="sm:w-52 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  TVA (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                             text-gray-900 focus:outline-none focus:ring-2
                             focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Sous-total</span>
                  <span className="font-medium">{formatNum(subtotal)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>TVA ({taxRate}%)</span>
                    <span className="font-medium">{formatNum(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900
                                pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">{formatNum(total)} {currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                          px-4 py-3 rounded-xl">
            {error}
            {error.includes('Limite') && (
              <Link href="/upgrade" className="ml-2 underline font-medium">
                Passer en Pro
              </Link>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Link
            href={backHref}
            className="flex-1 text-center border border-gray-200 text-gray-600
                       font-medium py-3 rounded-xl hover:bg-gray-50 transition-all"
          >
            Annuler
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                       text-white font-semibold py-3 rounded-xl transition-all cursor-pointer"
          >
            {loading ? 'Enregistrement...' : `Créer le ${label}`}
          </button>
        </div>

      </div>
    </div>
  )
}