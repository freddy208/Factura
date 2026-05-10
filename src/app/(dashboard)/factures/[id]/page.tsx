import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Receipt, Calendar, DollarSign, FileText } from 'lucide-react'
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
    <main className="space-y-6 pb-20 sm:space-y-8">
      {/* Header premium */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl sm:rounded-3xl border border-blue-100 p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <Link
            href="/factures"
            className="group p-2 sm:p-3 bg-white/80 hover:bg-white rounded-lg sm:rounded-xl transition-all shadow-sm hover:shadow-md border border-white/50"
          >
            <ArrowLeft size={20} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <Receipt size={18} className="text-white" />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900">{invoice.number}</h1>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${getStatusColor(invoice.status)}`}>
                  {getStatusLabel(invoice.status)}
                </span>
              </div>
            </div>
            <p className="text-slate-600 text-sm">
              Créée le {formatDate(invoice.created_at)} · {invoice.type === 'invoice' ? 'Facture' : 'Devis'}
            </p>
          </div>
        </div>
      </section>

      {/* Actions premium */}
      <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-lg">
        <InvoiceActions
          invoice={invoice}
          profile={profile}
          isPro={isPro}
        />
      </section>

      {/* Watermark notice plan free premium */}
      {!isPro && (
        <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl sm:rounded-3xl border border-amber-200 p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                <FileText size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  Le PDF aura un watermark &quot;Factura Free&quot;
                </p>
                <p className="text-xs text-amber-600 mt-0.5">Passez en Pro pour un PDF sans watermark</p>
              </div>
            </div>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              Passer en Pro
            </Link>
          </div>
        </section>
      )}

      {/* Carte facture premium */}
      <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
        {/* Header bleu premium */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 mb-4">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <p className="text-white text-sm font-bold">
                  {invoice.type === 'invoice' ? 'FACTURE' : 'DEVIS'}
                </p>
              </div>
              <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-black mt-2">{invoice.number}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm font-medium mb-2">
                {profile && (profile as any).company_name}
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 inline-block">
                <p className="text-white font-black text-xl sm:text-2xl">
                  {formatCurrency(invoice.total, invoice.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Infos émetteur / destinataire premium */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 px-4 sm:px-6 py-6 sm:py-8 border-b border-slate-100 sm:grid-cols-2">
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md sm:rounded-lg flex items-center justify-center">
                <Receipt size={14} className="text-white" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Émetteur
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-900">
                {(profile as any)?.company_name || 'Votre entreprise'}
              </p>
              {(profile as any)?.email && (
                <p className="text-sm text-slate-600">{(profile as any).email}</p>
              )}
              {(profile as any)?.phone && (
                <p className="text-sm text-slate-600">{(profile as any).phone}</p>
              )}
              {(profile as any)?.address && (
                <p className="text-sm text-slate-600">{(profile as any).address}</p>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md sm:rounded-lg flex items-center justify-center">
                <DollarSign size={14} className="text-white" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Client
              </p>
            </div>
            {invoice.clients ? (
              <div className="space-y-2">
                <p className="font-bold text-slate-900">
                  {(invoice.clients as any).name}
                </p>
                {(invoice.clients as any).company && (
                  <p className="text-sm text-slate-600">
                    {(invoice.clients as any).company}
                  </p>
                )}
                {(invoice.clients as any).email && (
                  <p className="text-sm text-slate-600">
                    {(invoice.clients as any).email}
                  </p>
                )}
                {(invoice.clients as any).phone && (
                  <p className="text-sm text-slate-600">
                    {(invoice.clients as any).phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Sans client</p>
            )}
          </div>
        </div>

        {/* Dates premium */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-br from-slate-50 to-gray-50 border-b border-slate-100 sm:grid-cols-2">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md sm:rounded-lg flex items-center justify-center">
                <Calendar size={14} className="text-white" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Date d&apos;émission</p>
            </div>
            <p className="text-base font-bold text-slate-900">
              {formatDate(invoice.issue_date)}
            </p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md sm:rounded-lg flex items-center justify-center">
                <Calendar size={14} className="text-white" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Date d&apos;échéance</p>
            </div>
            <p className="text-base font-bold text-slate-900">
              {invoice.due_date ? formatDate(invoice.due_date) : 'À réception'}
            </p>
          </div>
        </div>

        {/* Lignes premium */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-slate-500 to-gray-600 rounded-md sm:rounded-lg flex items-center justify-center">
                <FileText size={14} className="text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-600">
                Détails des prestations
              </p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-slate-200">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
                  <th className="text-left text-xs font-bold uppercase tracking-wide py-3 px-3 sm:py-4 sm:px-4 text-slate-700">
                    Description
                  </th>
                  <th className="text-center text-xs font-bold uppercase tracking-wide py-3 px-2 sm:py-4 sm:px-2 w-16 sm:w-20 text-slate-700">
                    Qté
                  </th>
                  <th className="text-right text-xs font-bold uppercase tracking-wide py-3 px-3 sm:py-4 sm:px-4 w-24 sm:w-32 text-slate-700">
                    Prix unit.
                  </th>
                  <th className="text-right text-xs font-bold uppercase tracking-wide py-3 px-3 sm:py-4 sm:px-4 w-24 sm:w-32 text-slate-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any, index: number) => (
                  <tr key={item.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                    <td className="py-3 px-3 sm:py-4 sm:px-4 text-slate-900 font-medium text-sm sm:text-base">{item.description}</td>
                    <td className="py-3 px-2 sm:py-4 sm:px-2 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-100 to-gray-100 text-xs sm:text-sm font-bold text-slate-700 shadow-sm">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-4 text-right text-slate-600 font-medium text-sm sm:text-base">
                      {formatCurrency(item.unit_price, invoice.currency)}
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-4 text-right font-bold text-slate-900 text-sm sm:text-base">
                      {formatCurrency(item.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totaux premium */}
        <div className="px-6 py-6 border-t border-slate-100 bg-gradient-to-br from-slate-50 to-gray-50">
          <div className="flex flex-col items-end space-y-3">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm">
              <div className="flex justify-between w-full sm:w-56 text-sm text-slate-600 mb-2">
                <span className="font-medium">Sous-total</span>
                <span className="font-bold">
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between w-full sm:w-56 text-sm text-slate-600 mb-2">
                  <span className="font-medium">TVA ({invoice.tax_rate}%)</span>
                  <span className="font-bold">
                    {formatCurrency(invoice.tax_amount, invoice.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between w-full sm:w-56 font-black text-slate-900
                              pt-3 border-t-2 border-slate-200 rounded-t-xl">
                <span className="text-lg">Total</span>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl">
                  <span className="text-lg font-black">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes premium */}
        {invoice.notes && (
          <div className="px-4 sm:px-6 py-4 sm:py-6 border-t border-slate-100 bg-gradient-to-br from-slate-50 to-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-slate-500 to-gray-600 rounded-md sm:rounded-lg flex items-center justify-center">
                <FileText size={14} className="text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-600">
                Notes
              </p>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{invoice.notes}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}