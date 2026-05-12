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
    <main className="space-y-5 pb-24 sm:space-y-6 sm:pb-8">
      {/* Header premium */}
      <section className="rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-3 sm:p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm">
              <FileText size={16} className="text-white sm:hidden" />
              <FileText size={20} className="text-white hidden sm:block" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Gestion des Devis</p>
              <h1 className="mt-1 text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                Devis
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {quotes?.length || 0} devis au total. Créez et suivez vos propositions commerciales.
              </p>
            </div>
          </div>
          <Link
            href="/devis/nouveau"
            className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
                      text-white font-semibold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nouveau devis</span>
          </Link>
        </div>
      </section>

      {!quotes || quotes.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8 text-center shadow-sm">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-indigo-600 sm:hidden" />
            <FileText size={32} className="text-indigo-600 hidden sm:block" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base sm:text-lg mb-2">Aucun devis</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            Créez votre premier devis et convertissez-le en facture en 1 clic avec notre système intelligent
          </p>
          <Link
            href="/devis/nouveau"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
                       text-white font-semibold px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
          >
            <Plus size={14} className="sm:hidden" />
            <Plus size={16} className="hidden sm:block" />
            <span className="hidden sm:inline">Créer votre premier devis</span>
            <span className="sm:hidden">Créer</span>
          </Link>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-700">
              {quotes.length} devis trouvés
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {quotes.map((quote: any, index: number) => (
              <Link
                key={quote.id}
                href={`/devis/${quote.id}`}
                className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4
                           hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50 transition-all duration-200 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl sm:rounded-2xl flex items-center
                                  justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <FileText size={14} className="text-indigo-600 sm:hidden" />
                    <FileText size={18} className="text-indigo-600 hidden sm:block" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">
                      {quote.number}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {quote.clients?.name || 'Sans client'} · {formatDate(quote.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`hidden sm:block text-xs font-medium px-2.5 py-1
                                   rounded-full ${getStatusColor(quote.status)} shadow-sm`}>
                    {getStatusLabel(quote.status)}
                  </span>
                  <span className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                    {formatCurrency(quote.total, quote.currency)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}