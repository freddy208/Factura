'use client'
import { useState } from 'react'
import { useSafeRouter } from '@/hooks/useRouter'
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
  const router = useSafeRouter()
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
    router.redirect(invoice.type === 'invoice' ? '/factures' : '/devis')
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

    router.redirect(`/factures/${newInvoice.id}`)
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
      <div className="flex flex-wrap gap-3 mb-6">
      {/* Télécharger PDF */}
      <button
        onClick={handleDownloadPDF}
        disabled={loading === 'pdf'}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                   disabled:opacity-60 text-white font-semibold px-4 py-2.5
                   rounded-xl transition-all duration-200 text-sm cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 disabled:scale-100 group"
      >
        <Download size={16} className="group-hover:scale-110 transition-transform" />
        {loading === 'pdf' ? (
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Génération...
          </span>
        ) : (
          'Télécharger PDF'
        )}
      </button>

      {/* Marquer envoyée */}
      {invoice.status === 'draft' && (
        <button
          onClick={() => updateStatus('sent')}
          disabled={!!loading}
          className="flex items-center gap-2 bg-white border border-slate-200
                     hover:bg-slate-50 hover:border-indigo-200 disabled:opacity-60 text-slate-700
                     font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-sm cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105 disabled:scale-100 group"
        >
          <Send size={16} className="group-hover:scale-110 transition-transform" />
          {loading === 'sent' ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              Envoi...
            </span>
          ) : (
            'Marquer envoyée'
          )}
        </button>
      )}

      {/* Marquer payée */}
      {(invoice.status === 'sent' || invoice.status === 'draft') && (
        <button
          onClick={() => updateStatus('paid')}
          disabled={!!loading}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                     disabled:opacity-60 text-white font-semibold px-4 py-2.5
                     rounded-xl transition-all duration-200 text-sm cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 disabled:scale-100 group"
        >
          <CheckCircle size={16} className="group-hover:scale-110 transition-transform" />
          {loading === 'paid' ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Mise à jour...
            </span>
          ) : (
            'Marquer payée'
          )}
        </button>
      )}

      {/* Convertir devis → facture */}
      {invoice.type === 'quote' && (
        <button
          onClick={handleConvert}
          disabled={!!loading}
          className={`flex items-center gap-2 font-semibold px-4 py-2.5
                     rounded-xl transition-all duration-200 text-sm cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 disabled:scale-100 group
                     ${isPro
                       ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                       : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-400 cursor-not-allowed hover:from-gray-100 hover:to-slate-100'
                     }`}
        >
          <ArrowRight size={16} className={`group-hover:scale-110 transition-transform ${!isPro ? 'opacity-50' : ''}`} />
          {loading === 'convert' ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Conversion...
            </span>
          ) : (
            'Convertir en facture'
          )}
          {!isPro && (
            <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 px-2 py-0.5 rounded-md font-semibold shadow-sm">
              PRO
            </span>
          )}
        </button>
      )}

      {/* Supprimer */}
      <button
        onClick={handleDelete}
        disabled={!!loading}
        className="flex items-center gap-2 bg-white border border-slate-200
                   hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-200 hover:text-red-600
                   disabled:opacity-60 text-slate-400 font-semibold px-4 py-2.5
                   rounded-xl transition-all duration-200 text-sm cursor-pointer ml-auto shadow-sm hover:shadow-md transform hover:scale-105 disabled:scale-100 group"
      >
        <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
        {loading === 'delete' ? (
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Suppression...
          </span>
        ) : (
          'Supprimer'
        )}
      </button>
      </div>
    </>
  )
}