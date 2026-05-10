'use client'
import { TrendingUp, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface InvoiceStatsProps {
  totalPaid: number
  totalPending: number
}

export default function InvoiceStats({ totalPaid, totalPending }: InvoiceStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="group bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <DollarSign size={20} className="text-white" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-1 rounded-lg">Encaissé</div>
        </div>
        <p className="text-2xl font-bold text-green-700">
          {formatCurrency(totalPaid)}
        </p>
        <p className="text-xs text-green-600 mt-1 font-medium">Montant total reçu</p>
      </div>
      <div className="group bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">En attente</div>
        </div>
        <p className="text-2xl font-bold text-amber-700">
          {formatCurrency(totalPending)}
        </p>
        <p className="text-xs text-amber-600 mt-1 font-medium">À encaisser</p>
      </div>
    </div>
  )
}
