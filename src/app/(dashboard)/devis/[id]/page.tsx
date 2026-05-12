import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import InvoiceActions from '@/components/invoices/InvoiceActions'

export default async function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: invoice } = await (supabase
    .from('invoices')
    .select('*, clients(*), invoice_items(*)') as any)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!invoice) notFound()

  const { data: profile } = await (supabase
    .from('profiles')
    .select('*') as any)
    .eq('id', user.id)
    .single()

  type ProfileResult = { plan: 'free' | 'pro' }
  const isPro = (profile as ProfileResult | null)?.plan === 'pro'
  const items = invoice.invoice_items
    ?.sort((a: any, b: any) => a.position - b.position) || []

  return (
    <main className="space-y-5 pb-24 sm:space-y-6 sm:pb-8">
      {/* Header premium */}
      <section className="rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/devis"
              className="tap-target p-2.5 hover:bg-indigo-100 rounded-2xl transition-all duration-200 text-slate-500 hover:text-indigo-600 group"
            >
              <ArrowLeft size={20} className="group-hover:scale-110 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{invoice.number}</h1>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shadow-sm
                                 ${getStatusColor(invoice.status)}`}>
                  {getStatusLabel(invoice.status)}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                Créé le {formatDate(invoice.created_at)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-white to-indigo-50 p-4 shadow-sm">
        <InvoiceActions invoice={invoice} profile={profile} isPro={isPro} />
      </section>

      {/* Watermark notice plan free */}
      {!isPro && (
        <section className="rounded-3xl border border-amber-200/50 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  La conversion devis → facture est réservée au plan Pro
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Débloquez des fonctionnalités avancées
                </p>
              </div>
            </div>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Passer en Pro
            </Link>
          </div>
        </section>
      )}

      {/* Carte devis */}
      <section className="overflow-hidden rounded-3xl border border-indigo-200/50 bg-white shadow-lg">
        {/* Header premium */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 px-6 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/20 backdrop-blur-sm px-3 py-1.5 mb-3 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <p className="text-indigo-100 text-sm font-semibold">
                  DEVIS
                </p>
              </div>
              <p className="text-white text-2xl font-bold mt-1 drop-shadow-sm">{invoice.number}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-100 text-sm font-medium">
                {(profile as any)?.company_name}
              </p>
              <p className="text-white font-bold text-xl mt-1 drop-shadow-sm">
                {formatCurrency(invoice.total, invoice.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Infos émetteur / destinataire */}
        <div className="grid grid-cols-1 gap-6 px-6 py-6 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50 sm:grid-cols-2">
          <div className="group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                De
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-900 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {(profile as any)?.company_name || 'Votre entreprise'}
              </p>
            </div>
          </div>
          <div className="group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                À
              </p>
            </div>
            {invoice.clients ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-900 text-sm">
                  {(invoice.clients as any).name}
                </p>
                {(invoice.clients as any).company && (
                  <p className="text-xs text-slate-500">
                    {(invoice.clients as any).company}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Sans client</p>
            )}
          </div>
        </div>

        {/* Lignes */}
        <div className="px-6 py-4 bg-gradient-to-b from-white to-slate-50">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                Détails des prestations
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs text-slate-400 font-semibold
                                 uppercase tracking-wide pb-3">
                    Description
                  </th>
                  <th className="text-center text-xs text-slate-400 font-semibold
                                 uppercase tracking-wide pb-3 w-16">
                    Qté
                  </th>
                  <th className="text-right text-xs text-slate-400 font-semibold
                                 uppercase tracking-wide pb-3 w-28">
                    Prix unit.
                  </th>
                  <th className="text-right text-xs text-slate-400 font-semibold
                                 uppercase tracking-wide pb-3 w-28">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item: any, index: number) => (
                  <tr key={item.id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50 transition-all duration-200 group" style={{ animationDelay: `${index * 100}ms` }}>
                    <td className="py-3 text-slate-900 font-medium">{item.description}</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 text-xs font-semibold text-indigo-700 group-hover:scale-110 transition-transform">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-600">
                      {formatCurrency(item.unit_price, invoice.currency)}
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {formatCurrency(item.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totaux */}
        <div className="px-6 py-4 border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex flex-col items-end space-y-2">
            <div className="flex justify-between w-48 text-sm text-slate-500 group">
              <span className="font-medium">Sous-total</span>
              <span className="font-semibold text-slate-700">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            {invoice.tax_rate > 0 && (
              <div className="flex justify-between w-48 text-sm text-slate-500 group">
                <span className="font-medium">TVA ({invoice.tax_rate}%)</span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(invoice.tax_amount, invoice.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between w-48 font-bold text-slate-900
                            pt-3 border-t-2 border-slate-200 rounded-t-lg bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 -mr-3">
              <span className="text-lg">Total</span>
              <span className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="px-6 py-4 border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                Notes
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className="text-sm text-slate-600 leading-relaxed">{invoice.notes}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}