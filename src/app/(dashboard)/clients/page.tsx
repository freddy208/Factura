import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building2, Mail, Phone, Plus, Users, TrendingUp, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PremiumCard from '@/components/ui/PremiumCard'
import PremiumButton from '@/components/ui/PremiumButton'

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
    <main className="space-y-6 pb-20 sm:space-y-8">
      {/* Header premium */}
      <PremiumCard variant="elevated" padding="lg" hover={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Module Clients</p>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Vos clients</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Base client claire et prête pour une facturation rapide.
            </p>
          </div>
          <PremiumButton
            href="/clients/nouveau"
            variant="primary"
            size="lg"
            icon={<Plus size={18} />}
            iconPosition="left"
          >
            Nouveau client
          </PremiumButton>
        </div>
      </PremiumCard>

      {/* Stats cards premium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PremiumCard variant="default" padding="md" hover={true}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total clients</p>
              <p className="mt-1 text-xl font-black text-slate-900">{clientList.length}</p>
            </div>
          </div>
        </PremiumCard>
        
        <PremiumCard variant="default" padding="md" hover={true}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avec email</p>
              <p className="mt-1 text-xl font-black text-slate-900">{clientList.filter((c) => c.email).length}</p>
            </div>
          </div>
        </PremiumCard>
        
        <PremiumCard variant="default" padding="md" hover={true}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Phone size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avec téléphone</p>
              <p className="mt-1 text-xl font-black text-slate-900">{clientList.filter((c) => c.phone).length}</p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {clientList.length === 0 ? (
        <PremiumCard variant="glass" padding="xl" className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Users size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Aucun client pour le moment</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">Créez votre première fiche client pour démarrer.</p>
          <PremiumButton
            href="/clients/nouveau"
            variant="primary"
            size="lg"
            icon={<Plus size={16} />}
            iconPosition="left"
            fullWidth
          >
            Ajouter un client
          </PremiumButton>
        </PremiumCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clientList.map((client) => (
            <Link href={`/clients/${client.id}`} key={client.id}>
              <PremiumCard
                variant="default"
                padding="lg"
                hover={true}
                interactive={true}
                className="group"
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                      {client.name}
                    </h3>
                    <p className="mt-1 truncate text-sm text-slate-600">
                      {client.company || 'Client individuel'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {client.email && (
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all duration-200">
                      <Mail size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
                      <span className="truncate text-sm text-slate-600 group-hover:text-blue-700 transition-colors duration-200">
                        {client.email}
                      </span>
                    </div>
                  )}
                  
                  {client.phone && (
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all duration-200">
                      <Phone size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
                      <span className="truncate text-sm text-slate-600 group-hover:text-blue-700 transition-colors duration-200">
                        {client.phone}
                      </span>
                    </div>
                  )}
                  
                  {client.address && (
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all duration-200">
                      <Building2 size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
                      <span className="truncate text-sm text-slate-600 group-hover:text-blue-700 transition-colors duration-200">
                        {client.address}
                      </span>
                    </div>
                  )}
                </div>
              </PremiumCard>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
