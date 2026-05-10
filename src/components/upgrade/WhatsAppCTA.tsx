'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppCTAProps {
  whatsappUrl: string
}

export default function WhatsAppCTA({ whatsappUrl }: WhatsAppCTAProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Effet de brillance animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
      
      <div className="text-center mb-3 sm:mb-4 relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 border border-white/30">
          <MessageCircle size={16} className="text-white sm:size-5" />
          <span className="text-white font-semibold text-xs sm:text-sm">Contact direct</span>
        </div>
        <h3 className="text-white text-base sm:text-lg font-bold mb-1.5 sm:mb-2">
          Prêt à passer en Pro ?
        </h3>
        <p className="text-green-100 text-xs sm:text-sm">
          Cliquez pour envoyer votre demande automatiquement
        </p>
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center gap-2 sm:gap-3 w-full bg-white hover:bg-green-50 text-green-700 font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden z-10"
      >
        {/* Effet de vague au hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <MessageCircle size={16} className="relative z-10 sm:size-5" />
        <span className="relative z-10 text-xs sm:text-sm sm:text-base">Contacter sur WhatsApp pour passer en Pro</span>
      </a>
    </section>
  )
}
