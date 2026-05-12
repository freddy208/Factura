import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Shield, ArrowLeft, LayoutDashboard, Users, CreditCard, BarChart3, Settings, FileText, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Navigation latérale */}
      <AdminNav />
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Administration</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Panel sécurisé</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Link 
                  href="/dashboard" 
                  className="tap-target flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm px-3 py-2 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Retour dashboard</span>
                  <span className="sm:hidden">Retour</span>
                </Link>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl">
                  <Shield size={16} className="text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700 hidden sm:inline">Admin</span>
                  <span className="text-xs font-semibold text-blue-700 sm:hidden">A</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}