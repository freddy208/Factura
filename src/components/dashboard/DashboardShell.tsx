'use client'

import { useState } from 'react'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import DashboardBottomNav from '@/components/dashboard/BottomNav'
import DashboardTopBar from '@/components/dashboard/TopBar'

type Profile = {
  full_name: string | null
  company_name: string | null
  plan: 'free' | 'pro'
  email: string
} | null

export default function DashboardShell({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: Profile
}) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar profile={profile} isDesktopSidebarOpen={isDesktopSidebarOpen} />

      <main className={`flex-1 pb-20 transition-all duration-300 lg:pb-0 ${isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <DashboardTopBar
          profile={profile}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          onDesktopSidebarToggle={() => setIsDesktopSidebarOpen((prev) => !prev)}
        />
        <div className="max-w-5xl mx-auto px-4 py-5 sm:py-6">{children}</div>
      </main>

      <DashboardBottomNav />
    </div>
  )
}
