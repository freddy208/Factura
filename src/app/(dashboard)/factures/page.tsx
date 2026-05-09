import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Receipt } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

export default async function FacturesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, clients(name, company)')
    .eq('user_id', user.id)
    .eq('type', 'invoice')
    .order('created_at', { ascending: false })

  const totalPaid = invoices
    ?.filter((i: any) => i.status === 'paid')
    .reduce((sum, i: any) => sum + (i.total || 0), 0) || 0

  const totalPending = invoices
    ?.filter((i: any) => i.status === 'sent')
    .reduce((sum, i: any) => sum + (i.total || 0), 0) || 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Factures</h1>
          <p className="text-slate-500 mt-1">
            {invoices?.length || 0} facture{(invoices?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/factures/nouvelle"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white font-semibold px-4 py-2.5 rounded-xl transition-all"
        >
          <Plus size={18} />
          Nouvelle facture
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">
            Encaissé
          </p>
          <p className="text-xl font-bold text-green-700 mt-1">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">
            En attente
          </p>
          <p className="text-xl font-bold text-orange-600 mt-1">
            {formatCurrency(totalPending)}
          </p>
        </div>
      </div>

      {/* Liste */}
      {!invoices || invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-16 text-center">
          <Receipt size={40} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-1">Aucune facture</h3>
          <p className="text-gray-500 text-sm mb-4">
            Créez votre première facture en moins de 2 minutes
          </p>
          <Link
            href="/factures/nouvelle"
            className="inline-flex items-center gap-2 bg-blue-600 text-white
                       font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all"
          >
            <Plus size={16} />
            Créer une facture
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {invoices.map((invoice: any) => (
              <Link
                key={invoice.id}
                href={`/factures/${invoice.id}`}
                className="flex items-center justify-between px-6 py-4
                           hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center
                                  justify-center flex-shrink-0">
                    <Receipt size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {invoice.number}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {invoice.clients?.name || 'Sans client'} · {formatDate(invoice.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`hidden sm:block text-xs font-medium px-2.5 py-1
                                   rounded-full ${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}