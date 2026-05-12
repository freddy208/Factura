'use client'
import { useState, useEffect } from 'react'
import { useSafeRouter } from '@/hooks/useRouter'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { usePremiumModal } from '@/hooks/usePremiumModal'
import { validateAndSanitizeItem, validateTaxRate, validateCurrency, sanitizeNotes } from '@/lib/security/sanitize'
import ClientSearch from '@/components/clients/ClientSearch'

type Item = {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
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
  const { alert, ModalComponent } = usePremiumModal()
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
    
    // Validation descriptions
    if (validItems.length === 0) {
      setError('Veuillez ajouter au moins une ligne avec une description pour continuer')
      return
    }
    
    // Validation quantités et prix
    const invalidItems = validItems.filter(item => 
      item.quantity <= 0 || 
      item.unit_price < 0 || 
      isNaN(item.quantity) || 
      isNaN(item.unit_price)
    )
    
    if (invalidItems.length > 0) {
      setError('Les quantités doivent être supérieures à 0 et les prix ne peuvent être négatifs')
      return
    }
    
    // Validation TVA
    if (taxRate < 0 || taxRate > 100) {
      setError('Le taux de TVA doit être compris entre 0 et 100%')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.redirect('/login'); return }

      // Sanitization et validation des données avant insertion
      const sanitizedItems = validItems.map(item => validateAndSanitizeItem(item))
      const sanitizedTaxRate = validateTaxRate(taxRate)
      const sanitizedCurrency = validateCurrency(currency)
      const sanitizedNotes = sanitizeNotes(notes)

      const { data: canCreate } = await supabase
        .rpc('check_quota', { p_user_id: user.id, p_type: type } as any)

      if (!canCreate) {
        await alert(
          'Limite atteinte',
          `Vous avez atteint votre limite de 5 ${label}s par mois. Passez à l'abonnement Pro pour continuer à créer des ${label}s sans limitation.`,
          'warning'
        )
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
          tax_rate: sanitizedTaxRate,
          tax_amount: subtotal * (sanitizedTaxRate / 100),
          total,
          notes: sanitizedNotes,
          currency: sanitizedCurrency,
        } as any)
        .select()
        .single()

      if (insertError || !invoice) {
        console.error('Invoice creation error:', insertError)
        if (insertError?.message?.includes('quota')) {
          setError('Limite de créations atteinte. Passez au plan Pro pour continuer.')
        } else if (insertError?.message?.includes('permission')) {
          setError('Permission refusée. Vérifiez vos droits.')
        } else {
          setError('Erreur lors de la création du devis. Veuillez réessayer.')
        }
        setLoading(false)
        return
      }

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(
          sanitizedItems.map((item, index) => ({
            invoice_id: (invoice as any).id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
            position: index,
          })) as any
        )

      if (itemsError) {
        console.error('Items insertion error:', itemsError)
        setError('Erreur lors de l\'ajout des lignes. Le devis a été créé mais les lignes n\'ont pas pu être ajoutées.')
        setLoading(false)
        return
      }

      router.redirect(`/${backHref.slice(1)}/${(invoice as any).id}`)

    } catch (err) {
      console.error('Unexpected error:', err)
      if (err instanceof Error) {
        if (err.message.includes('Network')) {
          setError('Erreur réseau. Vérifiez votre connexion et réessayez.')
        } else if (err.message.includes('timeout')) {
          setError('Délai d\'attente dépassé. Veuillez réessayer.')
        } else {
          setError('Erreur inattendue. Si le problème persiste, contactez le support.')
        }
      } else {
        setError('Erreur inattendue. Réessayez.')
      }
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto pb-24 sm:pb-8">

      {/* Header premium */}
      <section className="rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 shadow-sm sm:p-6 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            className="p-2.5 hover:bg-indigo-100 rounded-2xl transition-all duration-200 text-slate-500 hover:text-indigo-600 group"
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
        <section className="bg-white rounded-3xl border border-indigo-200/50 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
            <h2 className="font-semibold text-slate-900 text-lg">Informations générales</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label 
                htmlFor="client-search"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Client <span className="text-red-500">*</span>
              </label>
              <ClientSearch
                selectedClient={selectedClient}
                onClientSelect={setSelectedClient}
                placeholder="Rechercher un client par nom, entreprise, email..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label 
                  htmlFor="due-date"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Date d&apos;échéance
                </label>
                <input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  aria-label="Date d'échéance de la facture"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all bg-gradient-to-b from-white to-slate-50"
                />
              </div>
              <div>
                <label 
                  htmlFor="currency-select"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Devise
                </label>
                <select
                  id="currency-select"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  aria-label="Devise de la facture"
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
        <section className="bg-white rounded-3xl border border-indigo-200/50 p-6 shadow-sm">
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
              <div key={item.id} className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center group" style={{ animationDelay: `${index * 50}ms` }}>
                <input
                  className="w-full sm:col-span-5 px-3 py-2.5 rounded-xl border
                             border-slate-200 text-sm text-slate-900 placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all bg-gradient-to-b from-white to-slate-50 group-hover:shadow-md"
                  type="text"
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Description de la prestation"
                  aria-label={`Description de la prestation ${index + 1}`}
                  required
                />
                <input
                  className="w-full sm:col-span-2 px-3 py-2.5 rounded-xl border
                             border-slate-200 text-sm text-center text-slate-900
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all bg-gradient-to-b from-white to-slate-50 group-hover:shadow-md"
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  aria-label={`Quantité de la prestation ${index + 1}`}
                  required
                />
                <input
                  className="w-full sm:col-span-3 px-3 py-2.5 rounded-xl border
                             border-slate-200 text-sm text-right text-slate-900
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all bg-gradient-to-b from-white to-slate-50 group-hover:shadow-md"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={e => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  aria-label={`Prix unitaire de la prestation ${index + 1}`}
                  required
                />
                <div className="flex items-center justify-between sm:col-span-2 sm:justify-end sm:gap-2">
                  <span className="text-sm font-semibold text-slate-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
        <section className="bg-white rounded-3xl border border-indigo-200/50 p-6 shadow-sm">
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
                aria-label="Notes supplémentaires pour la facture"
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
                  step="0.1"
                  value={taxRate}
                  onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                  aria-label="Taux de TVA en pourcentage"
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
          <section 
            className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 text-red-700 text-sm
                            px-4 py-3 rounded-3xl shadow-sm animate-pulse" 
            role="alert" 
            aria-live="polite"
            id="invoice-form-error"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span className="font-medium">{error}</span>
              </div>
              {error.includes('Limite') && (
                <Link 
                  href="/upgrade" 
                  className="underline font-medium text-red-800 hover:text-red-900 transition-colors flex-shrink-0"
                  aria-label="Passer au plan Pro pour débloquer des fonctionnalités"
                >
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
                       font-semibold py-3 rounded-3xl hover:bg-slate-50 transition-all duration-200 group"
          >
            <span className="group-hover:scale-105 inline-block transition-transform">Annuler</span>
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            aria-label={`Créer la ${label}`}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed
                       text-white font-semibold py-3 rounded-3xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                Enregistrement en cours...
              </span>
            ) : (
              <span>Créer la {label}</span>
            )}
          </button>
        </div>

      </div>
      
      {/* Premium Modal Component */}
      <ModalComponent />
    </main>
  )
}