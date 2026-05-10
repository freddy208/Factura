'use client'
import Link from 'next/link'
import { Receipt } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

type Invoice = {
  id: string
  number: string | null
  status: string
  total: number | null
  created_at: string
  clients: {
    name: string | null
  } | null
}

interface InvoiceCardProps {
  invoice: Invoice
  index: number
}

export default function InvoiceCard({ invoice, index }: InvoiceCardProps) {
  return (
    <Link
      href={`/factures/${invoice.id}`}
      className={`group flex items-center justify-between px-6 py-4
                 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200
                 ${index === 0 ? 'border-t border-transparent' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center
                        justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-sm">
          <Receipt size={18} className="text-blue-600" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
            {invoice.number}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {invoice.clients?.name || 'Sans client'} · {formatDate(invoice.created_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`hidden sm:block text-xs font-bold px-3 py-1.5
                         rounded-full shadow-sm ${getStatusColor(invoice.status)}`}>
          {getStatusLabel(invoice.status)}
        </span>
        <span className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
          {formatCurrency(invoice.total || 0)}
        </span>
      </div>
    </Link>
  )
}
