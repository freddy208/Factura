'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Send, CheckCircle, ArrowRight, Trash2 } from 'lucide-react'
import { usePremiumModal } from '@/hooks/usePremiumModal'

export default function InvoiceActions({
  invoice,
  profile,
  isPro,
}: {
  invoice: any
  profile: any
  isPro: boolean
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const { alert, confirm, setLoading: setModalLoading, ModalComponent } = usePremiumModal()

  async function updateStatus(status: string) {
    setLoading(status)
    const supabase = createClient()
    const { error } = await (supabase.from('invoices') as any)
      .update({ status })
      .eq('id', invoice.id)
    setLoading(null)
    if (error) {
      await alert('Erreur', error.message || 'Impossible de mettre à jour le statut.', 'danger')
      return
    }
    window.location.reload()
  }

  async function handleDelete() {
    const confirmed = await confirm(
      'Supprimer la facture',
      'Supprimer cette facture ? Cette action est irréversible.',
      'danger',
      { confirmText: 'Supprimer', cancelText: 'Annuler' }
    )
    if (!confirmed) return
    
    setLoading('delete')
    setModalLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('invoices').delete().eq('id', invoice.id)
    setLoading(null)
    setModalLoading(false)
    if (error) {
      await alert('Erreur', error.message || 'Suppression impossible.', 'danger')
      return
    }
    window.location.href = invoice.type === 'invoice' ? '/factures' : '/devis'
  }

  async function handleConvert() {
    if (!isPro) {
      await alert(
        'Fonctionnalité Pro',
        'La conversion devis → facture est une fonctionnalité réservée aux abonnés Pro.',
        'warning'
      )
      return
    }
    setLoading('convert')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(null)
      await alert('Session expirée', 'Votre session a expiré. Veuillez vous reconnecter.', 'warning')
      return
    }

    const { data: number, error: numErr } = await (supabase
      .rpc('generate_invoice_number', { p_user_id: user.id, p_type: 'invoice' } as any) as any)

    if (numErr) {
      console.error(numErr)
      await alert('Erreur de numérotation', numErr.message || 'Erreur de numérotation.', 'danger')
      setModalLoading(false)
      setLoading(null)
      return
    }

    const { data: newInvoice, error: invErr } = await (supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: invoice.client_id,
        type: 'invoice',
        number: number || 'FACT-0001',
        status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: invoice.due_date,
        subtotal: invoice.subtotal,
        tax_rate: invoice.tax_rate,
        tax_amount: invoice.tax_amount,
        total: invoice.total,
        notes: invoice.notes,
        currency: invoice.currency,
        converted_from: invoice.id,
      } as any)
      .select()
      .single() as any)

    if (invErr || !newInvoice) {
      await alert('Erreur de création', invErr?.message || 'Impossible de créer la facture.', 'danger')
      setModalLoading(false)
      setLoading(null)
      return
    }

    const items = invoice.invoice_items?.map((item: any) => ({
      invoice_id: newInvoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
      position: item.position,
    })) || []

    const { error: itemsErr } = await (supabase.from('invoice_items') as any).insert(items)
    if (itemsErr) {
      await alert('Erreur de copie', itemsErr.message || 'Facture créée mais lignes non copiées.', 'warning')
      setModalLoading(false)
      setLoading(null)
      return
    }

    window.location.href = `/factures/${newInvoice.id}`
    setLoading(null)
  }

  async function handleDownloadPDF() {
    setLoading('pdf')
    try {
      const { generateInvoicePDF } = await import('@/lib/pdf/generator')
      const doc = await generateInvoicePDF(invoice, profile, isPro)
      doc.save(`${invoice.number}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
      await alert('Erreur PDF', 'Erreur lors de la génération du PDF. Veuillez réessayer.', 'danger')
    }
    setLoading(null)
  }

  return (
    <>
      <ModalComponent />
      <div className="flex flex-wrap gap-2 mb-6">
      {/* Télécharger PDF */}
      <button
        onClick={handleDownloadPDF}
        disabled={loading === 'pdf'}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                   disabled:opacity-60 text-white font-semibold px-4 py-2.5
                   rounded-xl transition-all text-sm cursor-pointer"
      >
        <Download size={16} />
        {loading === 'pdf' ? 'Génération...' : 'Télécharger PDF'}
      </button>

      {/* Marquer envoyée */}
      {invoice.status === 'draft' && (
        <button
          onClick={() => updateStatus('sent')}
          disabled={!!loading}
          className="flex items-center gap-2 bg-white border border-gray-200
                     hover:bg-gray-50 disabled:opacity-60 text-gray-700
                     font-semibold px-4 py-2.5 rounded-xl transition-all text-sm cursor-pointer"
        >
          <Send size={16} />
          {loading === 'sent' ? '...' : 'Marquer envoyée'}
        </button>
      )}

      {/* Marquer payée */}
      {(invoice.status === 'sent' || invoice.status === 'draft') && (
        <button
          onClick={() => updateStatus('paid')}
          disabled={!!loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700
                     disabled:opacity-60 text-white font-semibold px-4 py-2.5
                     rounded-xl transition-all text-sm cursor-pointer"
        >
          <CheckCircle size={16} />
          {loading === 'paid' ? '...' : 'Marquer payée'}
        </button>
      )}

      {/* Convertir devis → facture */}
      {invoice.type === 'quote' && (
        <button
          onClick={handleConvert}
          disabled={!!loading}
          className={`flex items-center gap-2 font-semibold px-4 py-2.5
                     rounded-xl transition-all text-sm cursor-pointer
                     ${isPro
                       ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                       : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                     }`}
        >
          <ArrowRight size={16} />
          {loading === 'convert' ? '...' : 'Convertir en facture'}
          {!isPro && (
            <span className="text-xs bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-md">
              PRO
            </span>
          )}
        </button>
      )}

      {/* Supprimer */}
      <button
        onClick={handleDelete}
        disabled={!!loading}
        className="flex items-center gap-2 bg-white border border-gray-200
                   hover:bg-red-50 hover:border-red-200 hover:text-red-600
                   disabled:opacity-60 text-gray-400 font-semibold px-4 py-2.5
                   rounded-xl transition-all text-sm cursor-pointer ml-auto"
      >
        <Trash2 size={16} />
        {loading === 'delete' ? '...' : 'Supprimer'}
      </button>
      </div>
    </>
  )
}