'use client'

import Link from 'next/link'
import { FileText, Plus, Users } from 'lucide-react'

export default function DashboardActions() {
  return (
    <section className="rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 sm:text-base">Actions rapides</h2>
        <span className="text-xs text-slate-500">1 action, 1 objectif</span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <Link
          href="/factures/nouvelle"
          className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-95 hover:shadow-md hover:scale-[1.02]"
        >
          <Plus size={18} />
          Nouvelle facture
        </Link>
        <Link
          href="/devis/nouveau"
          className="flex items-center gap-2.5 rounded-xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-indigo-100 px-4 py-3 text-sm font-semibold text-indigo-800 transition-all duration-200 hover:bg-indigo-200 hover:shadow-sm hover:scale-[1.02]"
        >
          <FileText size={18} />
          Nouveau devis
        </Link>
        <Link
          href="/clients/nouveau"
          className="flex items-center gap-2.5 rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-3 text-sm font-semibold text-purple-800 transition-all duration-200 hover:bg-purple-200 hover:shadow-sm hover:scale-[1.02]"
        >
          <Users size={18} />
          Ajouter un client
        </Link>
      </div>
    </section>
  )
}
