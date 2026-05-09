import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import AdminActivateButton from '@/components/admin/AdminActivateButton'
import { Users, CheckCircle, Clock, TrendingUp, Shield } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  const adminClient = createAdminClient()

  // Tous les profils
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Demandes en attente
  const { data: pendingRequests } = await adminClient
    .from('payment_requests')
    .select('*, profiles(email, company_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const totalUsers = profiles?.length || 0
  const proUsers = profiles?.filter((p: any) => p.plan === 'pro').length || 0
  const freeUsers = totalUsers - proUsers
  const pendingCount = pendingRequests?.length || 0

  return (
    <div className="space-y-6">
      {/* Header premium */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Panel Admin</h1>
                <p className="text-slate-500 text-sm mt-0.5">Gestion complète de FACTURA</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>Session sécurisée</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users size={14} />
              <span>{totalUsers} utilisateurs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats premium */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
              Total Utilisateurs
            </p>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp size={12} />
              <span>+12%</span>
            </div>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
              Plans Pro
            </p>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <CheckCircle size={16} className="text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-blue-600">{proUsers}</p>
            <span className="text-xs text-slate-500">actifs</span>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
              Plans Free
            </p>
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-slate-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-slate-900">{freeUsers}</p>
            <span className="text-xs text-slate-500">actifs</span>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-amber-600 uppercase tracking-wide font-medium">
              En Attente
            </p>
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm">
              <Clock size={16} className="text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
            <span className="text-xs text-amber-500">validations</span>
          </div>
        </div>
      </section>

      {/* Demandes en attente */}
      {pendingRequests && pendingRequests.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-900">
                  Demandes en attente
                </h2>
                <p className="text-amber-600 text-sm mt-0.5">
                  {pendingCount} validation{pendingCount > 1 ? 's' : ''} requise{pendingCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
              <span>À traiter</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {pendingRequests.map((req: any) => (
              <div
                key={req.id}
                className="group bg-white rounded-xl border border-amber-100 px-4 py-4
                           flex items-center justify-between transition-all duration-200 hover:bg-amber-50 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 font-bold text-sm">
                      {(req.profiles as any)?.company_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {(req.profiles as any)?.company_name || 'Sans entreprise'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(req.profiles as any)?.email} · {formatDate(req.created_at)}
                    </p>
                  </div>
                </div>
                <AdminActivateButton
                  userId={req.user_id}
                  requestId={req.id}
                  userEmail={(req.profiles as any)?.email}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Liste tous les utilisateurs */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">Tous les utilisateurs</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gestion complète des comptes FACTURA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{profiles?.length || 0} comptes</span>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Actifs</span>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {profiles?.map((profile: any, index: number) => (
            <div
              key={profile.id}
              className={`group flex items-center justify-between px-6 py-4 transition-all duration-200 ${
                index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              } hover:bg-blue-50`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">
                      {(profile.company_name || profile.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {profile.plan === 'pro' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900 text-sm">
                      {profile.company_name || 'Sans entreprise'}
                    </p>
                    {profile.plan === 'pro' && (
                      <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                        <CheckCircle size={10} className="text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700">Pro</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{profile.email}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Inscrit le {formatDate(profile.created_at)}</span>
                    {profile.pro_activated_at && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 font-medium">Activé Pro</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {profile.plan === 'pro' ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Plan Actif</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium bg-slate-100
                                     px-3 py-1.5 rounded-full">
                      Free
                    </span>
                    <AdminActivateButton
                      userId={profile.id}
                      requestId={null}
                      userEmail={profile.email}
                      compact
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}