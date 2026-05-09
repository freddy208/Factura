import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

export default async function DevisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: quotes } = await supabase
    .from('invoices')
    .select('*, clients(name, company)')
    .eq('user_id', user.id)
    .eq('type', 'quote')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Devis</h1>
          <p className="text-slate-500 mt-1">
            {quotes?.length || 0} devis
          </p>
        </div>
        <Link
          href="/devis/nouveau"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white font-semibold px-4 py-2.5 rounded-xl transition-all"
        >
          <Plus size={18} />
          Nouveau devis
        </Link>
      </div>

      {!quotes || quotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 px-6 py-16 text-center">
          <FileText size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 mb-1">Aucun devis</h3>
          <p className="text-slate-500 text-sm mb-4">
            Créez votre premier devis et convertissez-le en facture en 1 clic
          </p>
          <Link
            href="/devis/nouveau"
            className="inline-flex items-center gap-2 bg-blue-600 text-white
                       font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all"
          >
            <Plus size={16} />
            Créer un devis
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {quotes.map((quote: any) => (
              <Link
                key={quote.id}
                href={`/devis/${quote.id}`}
                className="flex items-center justify-between px-6 py-4
                           hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center
                                  justify-center flex-shrink-0">
                    <FileText size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{quote.number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {quote.clients?.name || 'Sans client'} · {formatDate(quote.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`hidden sm:block text-xs font-medium px-2.5 py-1
                                   rounded-full ${getStatusColor(quote.status)}`}>
                    {getStatusLabel(quote.status)}
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(quote.total, quote.currency)}
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