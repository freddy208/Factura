'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  FileText, 
  TrendingUp 
} from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble'
  },
  {
    title: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
    description: 'Gestion des comptes'
  },
  {
    title: 'Forfaits',
    href: '/admin/plans',
    icon: CreditCard,
    description: 'Plans et abonnements'
  },
  {
    title: 'Statistiques',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Analytics détaillés'
  },
  {
    title: 'Factures',
    href: '/admin/invoices',
    icon: FileText,
    description: 'Toutes les factures'
  },
  {
    title: 'Performance',
    href: '/admin/performance',
    icon: TrendingUp,
    description: 'Métriques système'
  },
  {
    title: 'Gestion',
    href: '/admin/management',
    icon: Settings,
    description: 'Outils avancés'
  },
  {
    title: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuration'
  }
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <div>
            <span className="font-bold text-white text-lg">FACTURA</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-2 py-0.5 rounded-full shadow-sm">
                Admin
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                  isActive ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'
                }`}>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                </div>
                <div className="flex-1">
                  <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {item.title}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Système en ligne</span>
        </div>
      </div>
    </nav>
  )
}
