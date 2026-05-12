import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConnectionStatus from '@/components/dashboard/ConnectionStatus'
import DashboardStats from '@/components/dashboard/DashboardStats'
import DashboardActions from '@/components/dashboard/DashboardActions'
import DashboardInvoices from '@/components/dashboard/DashboardInvoices'

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
      <section className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <Image 
              src="/icon-192.png" 
              alt="Factura Logo"
              aria-label="Créer un compte Factura" 
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg shadow-sm"
              priority
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Dashboard Factura</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Bonjour, {greetingName}
              </h1>
              <p className="text-slate-600 mb-6 leading-relaxed">Créez votre première fiche client pour démarrer.</p>
              <ul>
                <li>Vos données sont modifiables à tout moment.</li>
              </ul>
            </div>
          </div>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
            Ready
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

      <DashboardStats
        totalPaid={totalPaid}
        totalPending={totalPending}
        invoiceCount={invoiceCount}
        quoteCount={quoteCount}
        clientCount={clientCount}
      />

      <DashboardActions />

      <DashboardInvoices invoiceList={invoiceList} />
    </main>
  )
}
