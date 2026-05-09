'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, LogOut, PanelLeft, Search, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ConnectionStatus from '@/components/dashboard/ConnectionStatus'

type Profile = {
  full_name: string | null
  company_name: string | null
  plan: 'free' | 'pro'
  email: string
} | null

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clients',
  '/devis': 'Devis',
  '/factures': 'Factures',
  '/upgrade': 'Upgrade',
}

const quickLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
  { href: '/clients/nouveau', label: 'Ajouter un client' },
  { href: '/devis', label: 'Devis' },
  { href: '/devis/nouveau', label: 'Nouveau devis' },
  { href: '/factures', label: 'Factures' },
  { href: '/factures/nouvelle', label: 'Nouvelle facture' },
  { href: '/upgrade', label: 'Upgrade' },
] as const

function resolvePageTitle(pathname: string): string {
  const directMatch = pageTitles[pathname]
  if (directMatch) return directMatch

  const partialMatch = Object.keys(pageTitles).find((route) => route !== '/dashboard' && pathname.startsWith(route))
  return partialMatch ? pageTitles[partialMatch] : 'Factura'
}

export default function DashboardTopBar({
  profile,
  isDesktopSidebarOpen,
  onDesktopSidebarToggle,
}: {
  profile: Profile
  isDesktopSidebarOpen: boolean
  onDesktopSidebarToggle: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const title = resolvePageTitle(pathname)
  const [query, setQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const filteredLinks = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return quickLinks.slice(0, 5)
    return quickLinks
      .filter((item) => item.label.toLowerCase().includes(normalized) || item.href.toLowerCase().includes(normalized))
      .slice(0, 5)
  }, [query])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function handleSearchSubmit() {
    const firstResult = filteredLinks[0]
    if (!firstResult) return
    router.push(firstResult.href)
    setIsSearchOpen(false)
    setQuery('')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onDesktopSidebarToggle}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 lg:inline-flex"
            aria-label={isDesktopSidebarOpen ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
            title={isDesktopSidebarOpen ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
          >
            <PanelLeft size={16} />
          </button>

          <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500">Factura workspace</p>
          <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConnectionStatus compact />

          <div className="relative hidden sm:block">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
              <Search size={14} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setIsSearchOpen(true)
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleSearchSubmit()
                  }
                  if (event.key === 'Escape') {
                    setIsSearchOpen(false)
                  }
                }}
                placeholder="Recherche rapide"
                className="w-40 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-500"
                aria-label="Recherche rapide de navigation"
              />
            </div>

            {isSearchOpen ? (
              <div className="absolute right-0 top-11 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                {filteredLinks.length > 0 ? (
                  filteredLinks.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        router.push(item.href)
                        setIsSearchOpen(false)
                        setQuery('')
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.href}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-2.5 py-2 text-xs text-slate-500">Aucun resultat</p>
                )}
              </div>
            ) : null}
          </div>

          {profile?.plan === 'free' ? (
            <Link
              href="/upgrade"
              className="hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95 sm:inline-flex"
            >
              <Zap size={14} />
              Pro
            </Link>
          ) : (
            <div className="hidden items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:inline-flex">
              Plan Pro
            </div>
          )}

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>

          <button
            onClick={handleLogout}
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Deconnexion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
