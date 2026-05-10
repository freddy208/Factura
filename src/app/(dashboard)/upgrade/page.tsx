import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle, Zap, Shield, Crown } from 'lucide-react'
import { PRO_MONTHLY_FCFA } from '@/lib/constants'
import UpgradeNotifyAdminButton from '@/components/upgrade/UpgradeNotifyAdminButton'
import PricingCards from '@/components/upgrade/PricingCards'
import WhatsAppCTA from '@/components/upgrade/WhatsAppCTA'

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('plan, company_name, email')
    .eq('id', user.id)
    .single()

  type ProfileResult = { plan: 'free' | 'pro'; company_name: string | null; email: string }
  const profile = profileData as ProfileResult | null

  if (profile?.plan === 'pro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center
                            justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Vous êtes déjà Pro 🎉
            </h1>
            <p className="text-slate-500 text-lg mb-6">
              Profitez de toutes les fonctionnalités sans limite.
            </p>
            <div className="flex items-center justify-center gap-3 bg-green-50 border border-green-200 px-6 py-3 rounded-xl">
              <Crown size={20} className="text-green-600" />
              <span className="text-green-700 font-semibold">Plan Actif</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const whatsappMessage = encodeURIComponent(
    `Bonjour, je souhaite passer en Pro sur Factura.\n\nEmail du compte : ${profile?.email || user.email}\nEntreprise : ${profile?.company_name || ''}\n\nJe vais effectuer le paiement de ${PRO_MONTHLY_FCFA.toLocaleString('fr-FR')} FCFA.`
  )

  const whatsappUrl = `https://wa.me/237620187495?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header premium */}
        <section className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-100
                          text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-6 shadow-lg animate-pulse">
            <Zap size={12} className="text-white sm:size-4" />
            Passez au niveau supérieur
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            Débloquez tout Factura
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mb-3">
            Factures illimitées, PDF premium, sans watermark
          </p>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500">
            <Shield size={14} className="text-slate-400 sm:size-4" />
            <span>Offre exclusive pour professionnels</span>
          </div>
        </section>

        {/* Cards plans premium */}
        <PricingCards />

        {/* Instructions paiement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-6">
          <h2 className="font-bold text-slate-900 text-base sm:text-lg mb-1">
            Comment passer en Pro ?
          </h2>
          <p className="text-slate-500 text-sm mb-4 sm:mb-6">
            Paiement simple en 3 étapes, activation sous 24h
          </p>

          <div className="space-y-4 sm:space-y-5">
            {/* Étape 1 */}
            <div className="flex gap-3 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center
                            justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                  Effectuez le virement de {PRO_MONTHLY_FCFA.toLocaleString('fr-FR')} FCFA
                </p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between bg-yellow-50 border
                                border-yellow-100 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-lg flex items-center
                                      justify-center text-white font-bold text-xs sm:text-sm">
                        MTN
                      </div>
                      <div>
                        <p className="text-xs text-yellow-700 font-medium">MTN Mobile Money</p>
                        <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                          +237 679997956
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-orange-50 border
                                border-orange-100 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center
                                      justify-center text-white font-bold text-xs sm:text-sm">
                        OM
                      </div>
                      <div>
                        <p className="text-xs text-orange-600 font-medium">Orange Money</p>
                        <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                          +237 691093420
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 2 */}
            <div className="flex gap-3 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center
                            justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                  Envoyez la preuve sur WhatsApp ( +237 620 187 495 )
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Capture d&apos;écran du reçu + votre email :{' '}
                  <span className="font-medium text-slate-700">
                    {profile?.email || user.email}
                  </span>
                </p>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="flex gap-3 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center
                            justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                  Activation sous 30min
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Votre compte sera upgradé et vous recevrez une confirmation par email
                </p>
              </div>
            </div>
          </div>
        </div>

        <UpgradeNotifyAdminButton />

        <WhatsAppCTA whatsappUrl={whatsappUrl} />

        {/* Footer info */}
        <footer className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-3">
            <Shield size={12} />
            <span>Activation manuelle par l&apos;équipe Factura sous 24h ouvrées</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Service client disponible</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Paiement sécurisé</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Garantie satisfaction</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
