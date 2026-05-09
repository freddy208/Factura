'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FileText, Receipt } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/devis', label: 'Devis', icon: FileText },
  { href: '/factures', label: 'Factures', icon: Receipt },
]

export default function DashboardBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t
                    border-gray-200 z-40 px-2 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-3 transition-all ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}