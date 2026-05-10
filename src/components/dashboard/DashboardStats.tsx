'use client'

import { formatCurrency } from '@/lib/utils'

type DashboardStatsProps = {
  totalPaid: number
  totalPending: number
  invoiceCount: number
  quoteCount: number
  clientCount: number
}

export default function DashboardStats({
  totalPaid,
  totalPending,
  invoiceCount,
  quoteCount,
  clientCount,
}: DashboardStatsProps) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <article className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-200/20">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Encaisse</p>
        <p className="mt-2 text-lg font-semibold text-emerald-900 sm:text-xl">{formatCurrency(totalPaid)}</p>
      </article>
      <article className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-100 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-200/20">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">En attente</p>
        <p className="mt-2 text-lg font-semibold text-amber-900 sm:text-xl">{formatCurrency(totalPending)}</p>
      </article>
      <article className="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-200/20">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Factures</p>
        <p className="mt-2 text-lg font-semibold text-blue-900 sm:text-xl">{invoiceCount}</p>
      </article>
      <article className="rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-purple-200/20">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-700">Devis / Clients</p>
        <p className="mt-2 text-lg font-semibold text-purple-900 sm:text-xl">
          {quoteCount} / {clientCount}
        </p>
      </article>
    </section>
  )
}
