import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building2, Mail, Phone, Plus, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type Client = {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, company, email, phone, address, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const clientList = (clients as Client[] | null) ?? []

  return (
    <main className="space-y-5 pb-20 sm:space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Module Clients</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Vos clients</h1>
            <p className="mt-2 text-sm text-slate-500">
              Base client claire et prete pour une facturation rapide.
            </p>
          </div>
          <Link
            href="/clients/nouveau"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-95 hover:shadow-md"
          >
            <Plus size={18} />
            Nouveau client
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total clients</p>
          <p className="mt-1.5 text-xl font-semibold text-slate-900">{clientList.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Avec email</p>
          <p className="mt-1.5 text-xl font-semibold text-slate-900">{clientList.filter((c) => c.email).length}</p>
        </article>
        <article className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Avec telephone</p>
          <p className="mt-1.5 text-xl font-semibold text-slate-900">{clientList.filter((c) => c.phone).length}</p>
        </article>
      </section>

      {clientList.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
          <Users size={40} className="mx-auto text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Aucun client pour le moment</h2>
          <p className="mt-1.5 text-sm text-slate-500">Creez votre premiere fiche client pour demarrer.</p>
          <Link
            href="/clients/nouveau"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Plus size={16} />
            Ajouter un client
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {clientList.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{client.name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{client.company || 'Client individuel'}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                  <Mail size={13} className="text-slate-400" />
                  <span className="truncate">{client.email || 'Email non renseigne'}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                  <Phone size={13} className="text-slate-400" />
                  <span className="truncate">{client.phone || 'Telephone non renseigne'}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                  <Building2 size={13} className="text-slate-400" />
                  <span className="truncate">{client.address || 'Adresse non renseignee'}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}
