import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import InvoiceActions from '@/components/invoices/InvoiceActions'

export default async function FactureDetailPage({
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

  type ProfileResult = { plan: 'free' | 'pro'; company_name: string | null }
  const userProfile = profile as ProfileResult | null
  const isPro = userProfile?.plan === 'pro'

  // Trier les items par position
  const items = invoice.invoice_items?.sort(
    (a: any, b: any) => a.position - b.position
  ) || []

  return (
    <main className="space-y-5 pb-24 sm:space-y-6 sm:pb-8">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/factures"
              className="tap-target p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{invoice.number}</h1>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                                 ${getStatusColor(invoice.status)}`}>
                  {getStatusLabel(invoice.status)}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                Créée le {formatDate(invoice.created_at)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <InvoiceActions
          invoice={invoice}
          profile={profile}
          isPro={isPro}
        />
      </section>

      {/* Watermark notice plan free */}
      {!isPro && (
        <section className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <p className="text-sm text-amber-700">
                Le PDF aura un watermark &quot;FACTURA FREE&quot;
              </p>
            </div>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-2 text-sm font-semibold text-white transition-colors"
            >
              Passer en Pro
            </Link>
          </div>
        </section>
      )}

      {/* Carte facture */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header bleu */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 py-1.5 mb-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <p className="text-blue-100 text-sm font-medium">
                  {invoice.type === 'invoice' ? 'FACTURE' : 'DEVIS'}
                </p>
              </div>
              <p className="text-white text-2xl font-bold mt-1">{invoice.number}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm font-medium">
                {profile && (profile as any).company_name}
              </p>
              <p className="text-white font-bold text-xl mt-1">
                {formatCurrency(invoice.total, invoice.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Infos émetteur / destinataire */}
        <div className="grid grid-cols-1 gap-6 px-6 py-6 border-b border-slate-100 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                De
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-900 text-sm">
                {(profile as any)?.company_name || 'Votre entreprise'}
              </p>
              {(profile as any)?.email && (
                <p className="text-xs text-slate-500">{(profile as any).email}</p>
              )}
              {(profile as any)?.phone && (
                <p className="text-xs text-slate-500">{(profile as any).phone}</p>
              )}
              {(profile as any)?.address && (
                <p className="text-xs text-slate-500">{(profile as any).address}</p>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
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
                {(invoice.clients as any).email && (
                  <p className="text-xs text-slate-500">
                    {(invoice.clients as any).email}
                  </p>
                )}
                {(invoice.clients as any).phone && (
                  <p className="text-xs text-slate-500">
                    {(invoice.clients as any).phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Sans client</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <p className="text-xs text-slate-400 font-medium">Date d&apos;émission</p>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {formatDate(invoice.issue_date)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
              <p className="text-xs text-slate-400 font-medium">Date d&apos;échéance</p>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {invoice.due_date ? formatDate(invoice.due_date) : 'À réception'}
            </p>
          </div>
        </div>

        {/* Lignes */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                Détails des prestations
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs text-slate-400 font-medium
                                 uppercase tracking-wide pb-3 font-medium">
                    Description
                  </th>
                  <th className="text-center text-xs text-slate-400 font-medium
                                 uppercase tracking-wide pb-3 w-16 font-medium">
                    Qté
                  </th>
                  <th className="text-right text-xs text-slate-400 font-medium
                                 uppercase tracking-wide pb-3 w-28 font-medium">
                    Prix unit.
                  </th>
                  <th className="text-right text-xs text-slate-400 font-medium
                                 uppercase tracking-wide pb-3 w-28 font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item: any, index: number) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-slate-900">{item.description}</td>
                    <td className="py-3 text-center text-slate-600">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-medium">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-600">
                      {formatCurrency(item.unit_price, invoice.currency)}
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(item.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totaux */}
        <div className="px-6 py-4 border-t border-slate-100">
          <div className="flex flex-col items-end space-y-2">
            <div className="flex justify-between w-48 text-sm text-slate-500">
              <span>Sous-total</span>
              <span className="font-medium">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            {invoice.tax_rate > 0 && (
              <div className="flex justify-between w-48 text-sm text-slate-500">
                <span>TVA ({invoice.tax_rate}%)</span>
                <span className="font-medium">
                  {formatCurrency(invoice.tax_amount, invoice.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between w-48 font-bold text-slate-900
                            pt-2 border-t border-slate-200 rounded-t-lg">
              <span>Total</span>
              <span className="text-blue-600 text-lg bg-blue-50 px-2 py-1 rounded-lg">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                Notes
              </p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{invoice.notes}</p>
          </div>
        )}
      </section>
    </main>
  )
}