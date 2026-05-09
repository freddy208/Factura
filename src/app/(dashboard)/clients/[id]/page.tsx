import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Building2, Mail, MapPin, Phone, Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import DeleteClientButton from '@/components/clients/DeleteClientButton'

type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  address: string | null
  created_at: string
}

type Invoice = {
  id: string
  type: 'invoice' | 'quote'
  number: string | null
  status: string
  total: number | null
  created_at: string
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clientData } = await supabase
    .from('clients')
    .select('id, name, email, phone, company, address, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const client = clientData as Client | null
  if (!client) notFound()

  const { data: invoicesData } = await supabase
    .from('invoices')
    .select('id, type, number, status, total, created_at')
    .eq('client_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const invoices = (invoicesData as Invoice[] | null) ?? []
  const totalBilled = invoices
    .filter((item) => item.type === 'invoice')
    .reduce((sum, item) => sum + (item.total ?? 0), 0)

  return (
    <main className="mx-auto max-w-3xl space-y-5 pb-20">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link href="/clients" className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Fiche client</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{client.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{client.company || 'Client individuel'}</p>
            </div>
          </div>
          <DeleteClientButton clientId={client.id} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total facture</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900">{formatCurrency(totalBilled)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Documents</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900">{invoices.length}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Coordonnees</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <Mail size={14} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-900">{client.email || 'Non renseigne'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <Phone size={14} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Telephone</p>
              <p className="text-sm font-medium text-slate-900">{client.phone || 'Non renseigne'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <Building2 size={14} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Entreprise</p>
              <p className="text-sm font-medium text-slate-900">{client.company || 'Non renseignee'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <MapPin size={14} className="mt-0.5 text-slate-400" />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Adresse</p>
              <p className="text-sm font-medium text-slate-900">{client.address || 'Non renseignee'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-semibold text-slate-900">Historique</h2>
          <Link
            href={`/factures/nouvelle?client=${client.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
          >
            <Receipt size={13} />
            Nouvelle facture
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">Aucun document pour ce client.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/${invoice.type === 'invoice' ? 'factures' : 'devis'}/${invoice.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 sm:px-5"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{invoice.number || 'Document'}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {invoice.type === 'invoice' ? 'Facture' : 'Devis'} · {formatDate(invoice.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
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
