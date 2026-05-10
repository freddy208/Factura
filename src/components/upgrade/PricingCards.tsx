'use client'

import { CheckCircle, Star, Crown } from 'lucide-react'
import { PRO_MONTHLY_FCFA } from '@/lib/constants'

const FREE_FEATURES = [
  '5 factures par mois',
  '5 devis par mois',
  'Watermark "Factura Free"',
  '1 utilisateur',
]

const PRO_FEATURES = [
  'Factures illimitées',
  'Devis illimités',
  'Sans watermark',
  'PDF premium',
  'Conversion devis → facture',
  'Dashboard complet',
  'Support prioritaire',
]

export default function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
      {/* Plan Gratuit */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300">
        {/* Badge plan actuel */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
          Plan actuel
        </div>
        
        <div className="mb-4 sm:mb-6">
          <p className="font-semibold text-slate-900 text-lg sm:text-xl mb-2">Gratuit</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900">0</span>
            <span className="text-slate-500 text-sm sm:text-lg">FCFA / mois</span>
          </div>
        </div>
        
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {FREE_FEATURES.map((f, index) => (
            <div key={f} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-slate-400 font-bold text-xs">{index + 1}</span>
              </div>
              <CheckCircle size={12} className="text-slate-300 flex-shrink-0 sm:size-4" />
              <span className="leading-tight">{f}</span>
            </div>
          ))}
        </div>
        
        <div className="w-full text-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl border border-slate-200
                      text-slate-400 text-xs sm:text-sm font-medium bg-slate-50">
          Plan actuel
        </div>
      </div>

      {/* Plan Pro */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]">
        {/* Badge populaire */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white text-blue-600 text-xs
                        font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg animate-pulse">
          RECOMMANDÉ
        </div>
        
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <div className="mb-4 sm:mb-6 relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Crown size={20} className="text-yellow-300 sm:size-6 animate-pulse" />
            <p className="font-semibold text-white text-lg sm:text-xl">Pro</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-white">
              {PRO_MONTHLY_FCFA.toLocaleString('fr-FR')}
            </span>
            <span className="text-blue-200 text-sm sm:text-lg">FCFA / mois</span>
          </div>
          <p className="text-blue-200 text-xs sm:text-sm mt-1">ou 5 USD / mois</p>
        </div>

        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 relative z-10">
          {PRO_FEATURES.map((f, index) => (
            <div key={f} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white transform transition-transform duration-200 hover:translate-x-1">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <Star size={10} className="text-yellow-300 sm:size-3" />
              </div>
              <CheckCircle size={12} className="text-blue-300 flex-shrink-0 sm:size-4" />
              <span className="leading-tight">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
