import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle, Zap, MessageCircle, Crown, Star, Shield } from 'lucide-react'
import { PRO_MONTHLY_FCFA } from '@/lib/constants'
import UpgradeNotifyAdminButton from '@/components/upgrade/UpgradeNotifyAdminButton'

const FREE_FEATURES = [
  '5 factures par mois',
  '5 devis par mois',
  'Watermark "FACTURA FREE"',
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
    `Bonjour, je souhaite passer en Pro sur FACTURA.\n\nEmail du compte : ${profile?.email || user.email}\nEntreprise : ${profile?.company_name || ''}\n\nJe vais effectuer le paiement de ${PRO_MONTHLY_FCFA.toLocaleString('fr-FR')} FCFA.`
  )

  const whatsappUrl = `https://wa.me/237620187495?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header premium */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-100
                          text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 shadow-lg">
            <Zap size={14} className="text-white" />
            Passez au niveau supérieur
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Débloquez tout FACTURA
          </h1>
          <p className="text-slate-500 text-lg mb-2">
            Factures illimitées, PDF premium, sans watermark
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Shield size={16} className="text-slate-400" />
            <span>Offre exclusive pour professionnels</span>
          </div>
        </section>

        {/* Cards plans premium */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Plan Gratuit */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            {/* Badge plan actuel */}
            <div className="absolute top-4 right-4 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
              Plan actuel
            </div>
            
            <div className="mb-6">
              <p className="font-semibold text-slate-900 text-lg mb-2">Gratuit</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">0</span>
                <span className="text-slate-500 text-lg">FCFA / mois</span>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {FREE_FEATURES.map((f, index) => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-5 h-5 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-400 font-bold text-xs">{index + 1}</span>
                  </div>
                  <CheckCircle size={14} className="text-slate-300 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            
            <div className="w-full text-center py-3 px-4 rounded-xl border border-slate-200
                          text-slate-400 text-sm font-medium bg-slate-50">
              Plan actuel
            </div>
          </div>

          {/* Plan Pro */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 shadow-xl transition-all duration-200 hover:shadow-2xl hover:-translate-y-1">
            {/* Badge populaire */}
            <div className="absolute top-4 right-4 bg-white text-blue-600 text-xs
                            font-bold px-3 py-1 rounded-full shadow-lg">
              RECOMMANDÉ
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Crown size={24} className="text-yellow-300" />
                <p className="font-semibold text-white text-xl">Pro</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">
                  {PRO_MONTHLY_FCFA.toLocaleString('fr-FR')}
                </span>
                <span className="text-blue-200 text-lg">FCFA / mois</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">ou 5 USD / mois</p>
            </div>

            <div className="space-y-3 mb-6">
              {PRO_FEATURES.map((f, index) => (
                <div key={f} className="flex items-center gap-3 text-sm text-white">
                  <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star size={12} className="text-yellow-300" />
                  </div>
                  <CheckCircle size={14} className="text-blue-300 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions paiement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="font-bold text-slate-900 text-lg mb-1">
            Comment passer en Pro ?
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Paiement simple en 3 étapes, activation sous 24h
          </p>

          <div className="space-y-5">
            {/* Étape 1 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center
                            justify-center text-white font-bold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  Effectuez le virement de {PRO_MONTHLY_FCFA.toLocaleString('fr-FR')} FCFA
                </p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between bg-yellow-50 border
                                border-yellow-100 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-xs text-yellow-700 font-medium">MTN Mobile Money</p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        +237 679997956
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center
                                    justify-center text-white text-xs font-bold">
                      MTN
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-orange-50 border
                                border-orange-100 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-xs text-orange-600 font-medium">Orange Money</p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        +237 691093420
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center
                                    justify-center text-white text-xs font-bold">
                      OM
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 2 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center
                            justify-center text-white font-bold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  Envoyez la preuve sur WhatsApp
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
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center
                            justify-center text-white font-bold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  Activation sous 24h
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Votre compte sera upgradé et vous recevrez une confirmation par email
                </p>
              </div>
            </div>
          </div>
        </div>

        <UpgradeNotifyAdminButton />

        {/* CTA WhatsApp premium */}
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
              <MessageCircle size={20} className="text-white" />
              <span className="text-white font-semibold">Contact direct</span>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">
              Prêt à passer en Pro ?
            </h3>
            <p className="text-green-100 text-sm">
              Cliquez pour envoyer votre demande automatiquement
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 w-full bg-white hover:bg-green-50 text-green-700 font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          >
            <MessageCircle size={20} />
            <span>Contacter sur WhatsApp pour passer en Pro</span>
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-700 transition-colors">
              <span className="text-white text-xs font-bold">→</span>
            </div>
          </a>
        </section>

        {/* Footer info */}
        <footer className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-3">
            <Shield size={14} />
            <span>Activation manuelle par l&apos;équipe FACTURA sous 24h ouvrées</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <span>✓ Service client disponible</span>
            <span>•</span>
            <span>Paiement sécurisé</span>
            <span>•</span>
            <span>Garantie satisfaction</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
