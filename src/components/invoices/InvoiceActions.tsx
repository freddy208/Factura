'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Send, CheckCircle, ArrowRight, Trash2 } from 'lucide-react'
import Link from 'next/link'

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

  async function updateStatus(status: string) {
    setLoading(status)
    const supabase = createClient()
    await (supabase.from('invoices') as any)
      .update({ status })
      .eq('id', invoice.id)
    window.location.reload()
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette facture ? Action irréversible.')) return
    setLoading('delete')
    const supabase = createClient()
    await supabase.from('invoices').delete().eq('id', invoice.id)
    window.location.href = invoice.type === 'invoice' ? '/factures' : '/devis'
  }

  async function handleConvert() {
    if (!isPro) {
      alert('La conversion devis → facture est une fonctionnalité Pro.')
      return
    }
    setLoading('convert')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: number } = await (supabase
      .rpc('generate_invoice_number', { p_user_id: user.id, p_type: 'invoice' } as any) as any)

    const { data: newInvoice } = await (supabase
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

    if (newInvoice) {
      // Copier les lignes
      const items = invoice.invoice_items?.map((item: any) => ({
        invoice_id: newInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        position: item.position,
      })) || []

      await (supabase.from('invoice_items') as any).insert(items)
      window.location.href = `/factures/${(newInvoice as any).id}`
    }
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
      alert('Erreur lors de la génération du PDF. Réessayez.')
    }
    setLoading(null)
  }

  return (
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
  )
}