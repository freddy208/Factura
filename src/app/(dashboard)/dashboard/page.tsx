import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileText, Plus, Receipt, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import ConnectionStatus from '@/components/dashboard/ConnectionStatus'

type InvoiceRow = {
  id: string
  number: string | null
  status: string
  total: number | null
  created_at: string
  clients: {
    name: string | null
  } | null
}

type Profile = {
  plan: 'free' | 'pro'
  company_name: string | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: invoices }, { data: quotes }, { data: clients }, { data: profile }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id, number, status, total, created_at, clients(name)')
      .eq('user_id', user.id)
      .eq('type', 'invoice')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('invoices').select('id').eq('user_id', user.id).eq('type', 'quote'),
    supabase.from('clients').select('id').eq('user_id', user.id),
    supabase.from('profiles').select('plan, company_name').eq('id', user.id).single(),
  ])

  const invoiceList = (invoices as InvoiceRow[] | null) ?? []
  const userProfile = (profile as Profile | null) ?? null

  const totalPaid = invoiceList
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + (item.total ?? 0), 0)

  const totalPending = invoiceList
    .filter((item) => item.status === 'sent')
    .reduce((sum, item) => sum + (item.total ?? 0), 0)

  const invoiceCount = invoiceList.length
  const quoteCount = quotes?.length ?? 0
  const clientCount = clients?.length ?? 0
  const greetingName = userProfile?.company_name?.trim() || 'votre espace'

  return (
    <main className="space-y-5 pb-24 sm:space-y-6 sm:pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Dashboard Factura</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Bonjour, {greetingName}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Vue rapide de votre activite. Mobile-first, claire et prete pour votre usage quotidien.
            </p>
          </div>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
            PWA Ready
          </span>
        </div>

        <div className="mt-4">
          <ConnectionStatus />
        </div>
      </section>

      {userProfile?.plan === 'free' ? (
        <section className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold sm:text-lg">Passez en Pro</h2>
              <p className="mt-1 text-sm text-blue-100">Factures illimitees, image premium, zero watermark.</p>
            </div>
            <Link
              href="/upgrade"
              className="whitespace-nowrap rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
            >
              2 500 FCFA/mois
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Encaisse</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">{formatCurrency(totalPaid)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">En attente</p>
          <p className="mt-2 text-lg font-semibold text-amber-600 sm:text-xl">{formatCurrency(totalPending)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Factures</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">{invoiceCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Devis / Clients</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">
            {quoteCount} / {clientCount}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">Actions rapides</h2>
          <span className="text-xs text-slate-500">1 action, 1 objectif</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
          <Link
            href="/factures/nouvelle"
            className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-95 hover:shadow-md"
          >
            <Plus size={18} />
            Nouvelle facture
          </Link>
          <Link
            href="/devis/nouveau"
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:bg-slate-100 hover:shadow-sm"
          >
            <FileText size={18} />
            Nouveau devis
          </Link>
          <Link
            href="/clients/nouveau"
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:bg-slate-100 hover:shadow-sm"
          >
            <Users size={18} />
            Ajouter un client
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">Dernieres factures</h2>
          <Link href="/factures" className="text-xs font-semibold text-blue-600 hover:underline sm:text-sm">
            Voir tout
          </Link>
        </div>

        {invoiceList.length === 0 ? (
          <div className="px-4 py-12 text-center sm:px-5">
            <Receipt size={32} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">Aucune facture pour le moment.</p>
            <Link href="/factures/nouvelle" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
              Creer votre premiere facture
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoiceList.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/factures/${invoice.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3.5 transition-all duration-200 hover:bg-slate-50 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{invoice.number || 'Facture sans numero'}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {invoice.clients?.name || 'Sans client'} · {formatDate(invoice.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.total ?? 0)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
