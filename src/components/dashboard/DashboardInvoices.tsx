'use client'

import Link from 'next/link'
import { Receipt } from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils'

type InvoiceRow = {
  id: string
  number: string | null
  status: string
  total: number | null
  created_at: string
  clients: {
    name: string | null
  } | null
}

type DashboardInvoicesProps = {
  invoiceList: InvoiceRow[]
}

export default function DashboardInvoices({ invoiceList }: DashboardInvoicesProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100/50 px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-semibold text-slate-900 sm:text-base">Dernières factures</h2>
        <Link href="/factures" className="text-xs font-semibold text-blue-600 hover:underline sm:text-sm">
          Voir tout
        </Link>
      </div>

      {invoiceList.length === 0 ? (
        <div className="px-4 py-12 text-center sm:px-5">
          <Receipt size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Aucune facture pour le moment.</p>
          <Link href="/factures/nouvelle" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
            Créer votre première facture
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100/50">
          {invoiceList.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/factures/${invoice.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3.5 transition-all duration-200 hover:bg-slate-50/50 sm:px-5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{invoice.number || 'Facture sans numéro'}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {invoice.clients?.name || 'Sans client'} · {formatDate(invoice.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusColor(invoice.status)}`}>
                  {getStatusLabel(invoice.status)}
                </span>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.total ?? 0)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
