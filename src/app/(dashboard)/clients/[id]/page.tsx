import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Building2, Mail, MapPin, Phone, Receipt, TrendingUp, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import DeleteClientButton from '@/components/clients/DeleteClientButton'
import PremiumCard from '@/components/ui/PremiumCard'
import PremiumButton from '@/components/ui/PremiumButton'

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
    <main className="mx-auto max-w-4xl xl:max-w-5xl px-4 sm:px-6 lg:px-8 space-y-5 pb-20">
      {/* Header premium */}
      <PremiumCard variant="elevated" padding="lg" hover={false}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <Link href="/clients" className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Fiche client</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{client.name}</h1>
                <p className="mt-1 text-sm text-slate-600">{client.company || 'Client individuel'}</p>
              </div>
            </div>
          </div>
          <DeleteClientButton clientId={client.id} />
        </div>
      </PremiumCard>

      {/* Stats premium */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PremiumCard variant="default" padding="md" hover={true}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total facture</p>
              <p className="mt-1 text-xl font-black text-slate-900 truncate">{formatCurrency(totalBilled)}</p>
            </div>
          </div>
        </PremiumCard>
        
        <PremiumCard variant="default" padding="md" hover={true}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</p>
              <p className="mt-1 text-xl font-black text-slate-900">{invoices.length}</p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Coordonnées premium */}
      <PremiumCard variant="default" padding="lg" hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Building2 size={12} className="text-white" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">Coordonnées</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
            <Mail size={14} className="mt-0.5 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-900 truncate">{client.email || 'Non renseigné'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
            <Phone size={14} className="mt-0.5 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Téléphone</p>
              <p className="text-sm font-medium text-slate-900 truncate">{client.phone || 'Non renseigné'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
            <Building2 size={14} className="mt-0.5 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Entreprise</p>
              <p className="text-sm font-medium text-slate-900 truncate">{client.company || 'Non renseigné'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
            <MapPin size={14} className="mt-0.5 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Adresse</p>
              <p className="text-sm font-medium text-slate-900 truncate">{client.address || 'Non renseigné'}</p>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Historique premium */}
      <PremiumCard variant="default" padding="lg" hover={false}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Receipt size={12} className="text-white" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Historique</h2>
          </div>
          <PremiumButton
            href={`/factures/nouvelle?client=${client.id}`}
            variant="primary"
            size="sm"
            icon={<Receipt size={13} />}
            iconPosition="left"
          >
            Nouvelle facture
          </PremiumButton>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-3 mx-auto">
              <FileText size={20} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">Aucun document pour ce client.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/${invoice.type === 'invoice' ? 'factures' : 'devis'}/${invoice.id}`}
                className="group block rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
                      {invoice.number || 'Document'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {invoice.type === 'invoice' ? 'Facture' : 'Devis'} · {formatDate(invoice.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusColor(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.total ?? 0)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PremiumCard>
    </main>
  )
}
