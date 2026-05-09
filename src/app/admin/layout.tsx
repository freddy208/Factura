import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header premium */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-lg">FACTURA</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      Admin
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Panel sécurisé</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="tap-target flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm px-3 py-2 rounded-xl hover:bg-slate-100 transition-all"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Retour dashboard</span>
              </Link>
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl">
                <Shield size={16} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Dashboard</span>
            <span>→</span>
            <span className="text-slate-900 font-medium">Administration</span>
          </div>
          
          {/* Content wrapper */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {children}
          </div>
        </div>
      </main>
      
      {/* Footer admin */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>© 2024 FACTURA - Panel Admin</span>
            <div className="flex items-center gap-4">
              <span>Accès sécurisé</span>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}