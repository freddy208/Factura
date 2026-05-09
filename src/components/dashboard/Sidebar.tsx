'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
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
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-lg font-bold text-gray-900">FACTURA</span>
        </div>
        <div className="mt-3 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/40 px-3 py-2.5 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Profil</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-900">{profile?.full_name || 'Utilisateur'}</p>
          <p className="mt-0.5 truncate text-xs text-slate-600">{profile?.company_name || 'Entreprise'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                         font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Plan badge + upgrade */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {profile?.plan === 'free' && (
          <Link
            href="/upgrade"
            className="flex items-center gap-2 w-full bg-gradient-to-r from-blue-600
                       to-indigo-600 text-white text-sm font-semibold px-4 py-3
                       rounded-xl hover:opacity-95 transition-all shadow-sm"
          >
            <Zap size={16} />
            Passer en Pro 2 500 FCFA
          </Link>
        )}

        {profile?.plan === 'pro' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50
                          rounded-xl border border-green-200">
            <Zap size={14} className="text-green-600" />
            <span className="text-sm font-medium text-green-700">Plan Pro actif</span>
          </div>
        )}

        {/* User info + logout */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Compte</p>
              <p className="mt-0.5 text-xs text-gray-600 truncate">{profile?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50
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