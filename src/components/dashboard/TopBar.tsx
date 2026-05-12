'use client'

import Link from 'next/link'
import { useMemo, useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, LogOut, PanelLeft, Search, Zap, Settings, User, ChevronDown } from 'lucide-react'
import { useSafeRouter } from '@/hooks/useRouter'
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
  const safeRouter = useSafeRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  const title = resolvePageTitle(pathname)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
    safeRouter.redirect('/login')
  }

  function handleSearchSubmit() {
    const firstResult = filteredLinks[0]
    if (!firstResult) return
    router.push(firstResult.href)
    setIsSearchOpen(false)
    setQuery('')
  }

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  // Get user initials for avatar
  function getUserInitials(name: string | null, email: string): string {
    if (name) {
      const names = name.trim().split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  // Render a simplified version during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <header className="sticky top-0 z-30 border-b border-blue-200/80 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-blue-100">Factura workspace</p>
              <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse"></div>
            <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse"></div>
            <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 border-b border-blue-200/80 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onDesktopSidebarToggle}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-blue-300/50 text-white/90 transition-colors hover:bg-white/20 hover:text-white lg:inline-flex"
            aria-label={isDesktopSidebarOpen ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
            title={isDesktopSidebarOpen ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
          >
            <PanelLeft size={16} />
          </button>

          <div className="min-w-0">
          <p className="text-[11px] font-medium text-blue-100">Factura workspace</p>
          <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConnectionStatus compact />

          <div className="relative hidden sm:block">
            <div className="flex items-center gap-2 rounded-xl border border-blue-300/50 bg-white/20 px-3 py-2">
              <Search size={14} className="text-blue-100" />
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
                className="w-40 bg-transparent text-xs text-white outline-none placeholder:text-blue-100"
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
              className="hidden items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition-opacity hover:bg-blue-50 sm:inline-flex"
            >
              <Zap size={14} />
              Pro
            </Link>
          ) : (
            <div className="hidden items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:inline-flex">
              Plan Pro
            </div>
          )}

          <Link
            href="/notifications"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-300/50 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </Link>

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-300/50 bg-white/20 text-white transition-colors hover:bg-white/30"
              aria-label="Menu utilisateur"
            >
              {profile ? (
                <span className="text-sm font-semibold">
                  {getUserInitials(profile.full_name, profile.email)}
                </span>
              ) : (
                <User size={16} />
              )}
            </button>

            {isUserMenuOpen && profile && (
              <div className="absolute right-0 top-11 w-48 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="border-b border-slate-100/50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {profile.full_name || profile.email}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                </div>
                
                <div className="py-1">
                  <Link
                    href="/profil"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User size={16} />
                    Profil
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings size={16} />
                    Paramètres
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsUserMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
