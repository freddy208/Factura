'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSafeRouter } from '@/hooks/useRouter'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  LogOut,
  Zap,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/devis', label: 'Devis', icon: FileText },
  { href: '/factures', label: 'Factures', icon: Receipt },
]

type Profile = {
  full_name: string | null
  company_name: string | null
  plan: 'free' | 'pro'
  email: string
} | null

export default function DashboardSidebar({
  profile,
  isDesktopSidebarOpen,
}: {
  profile: Profile
  isDesktopSidebarOpen: boolean
}) {
  const pathname = usePathname()
  const router = useSafeRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.redirect('/login')
  }

  return (
    <aside
      className={`hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white/95 border-r border-slate-200 z-40 backdrop-blur transition-transform duration-300 ${
        isDesktopSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center overflow-hidden">
            <Image
              src="/icon-192.png"
              alt="Factura"
              width={24}
              height={24}
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Factura</h1>
            <p className="text-xs text-slate-500">Gestion professionnelle</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-slate-200/50 bg-gradient-to-br from-blue-50 to-indigo-50/50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600">Profil</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-900">{profile?.full_name || 'Utilisateur'}</p>
          <p className="mt-0.5 truncate text-xs text-slate-600">{profile?.company_name || 'Entreprise'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                         font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/50 hover:text-slate-900 hover:shadow-sm'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : ''} />
              <span className={isActive ? 'font-semibold' : ''}>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Plan badge + upgrade */}
      <div className="p-4 border-t border-slate-100/50 space-y-3">
        {profile?.plan === 'free' && (
          <Link
            href="/upgrade"
            className="flex items-center gap-2 w-full bg-gradient-to-r from-blue-600
                       to-indigo-600 text-white text-sm font-semibold px-4 py-3
                       rounded-xl hover:opacity-95 transition-all shadow-md hover:shadow-lg"
          >
            <Zap size={16} />
            Passer en Pro 2 500 FCFA
          </Link>
        )}

        {profile?.plan === 'pro' && (
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50
                          rounded-xl border border-emerald-200/50 shadow-sm">
            <Zap size={14} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Plan Pro actif</span>
          </div>
        )}

        {/* User info + logout */}
        <div className="rounded-xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Compte</p>
              <p className="mt-0.5 text-xs text-slate-600 truncate">{profile?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50
                         rounded-lg transition-all"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}