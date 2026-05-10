import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Receipt } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import InvoiceStats from '@/components/invoices/InvoiceStats'
import InvoiceCard from '@/components/invoices/InvoiceCard'

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
    <div className="space-y-6 pb-20 sm:space-y-8">
      {/* Header premium */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border border-blue-100 p-6 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Receipt size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Module Factures</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-1">Factures</h1>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {invoices?.length || 0} facture{(invoices?.length || 0) > 1 ? 's' : ''} · Gérez votre facturation en toute simplicité
            </p>
          </div>
          <Link
            href="/factures/nouvelle"
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-5 py-3 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden sm:inline">Nouvelle facture</span>
            <span className="sm:hidden">Créer</span>
          </Link>
        </div>
      </div>

      {/* Stats premium */}
      <InvoiceStats totalPaid={totalPaid} totalPending={totalPending} />

      {/* Liste premium */}
      {!invoices || invoices.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-3xl border border-slate-200 px-8 py-16 text-center shadow-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Receipt size={36} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-900 text-xl mb-3">Aucune facture</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
            Créez votre première facture en moins de 2 minutes et commencez à facturer vos clients
          </p>
          <Link
            href="/factures/nouvelle"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            Créer votre première facture
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Liste des factures</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {invoices.map((invoice: any, index: number) => (
              <InvoiceCard key={invoice.id} invoice={invoice} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}