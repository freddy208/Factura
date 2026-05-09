'use client'

import { Wifi, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center">
          {/* Icône hors ligne */}
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Wifi size={40} className="text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Vous êtes hors ligne
          </h1>
          
          <p className="text-slate-500 text-lg mb-6">
            FACTURA fonctionne hors ligne. Vos données ont été sauvegardées localement.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 text-amber-700 text-sm">
              <RefreshCw size={16} />
              <span>Reconnexion automatique en cours...</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="tap-target flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
            >
              <Home size={18} />
              Retour à l'accueil
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="tap-target flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-all"
            >
              <RefreshCw size={18} />
              Actualiser la page
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-4">
            Vérifiez votre connexion internet pour accéder à toutes les fonctionnalités.
          </p>
        </div>
      </div>
    </div>
  )
}
