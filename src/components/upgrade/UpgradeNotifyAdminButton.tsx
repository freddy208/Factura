'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { notifyProPaymentInterestAction } from '@/app/actions/pro-upgrade'

export default function UpgradeNotifyAdminButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  )

  async function handleClick() {
    setLoading(true)
    setMessage(null)
    const result = await notifyProPaymentInterestAction()
    setLoading(false)

    if (!result.ok) {
      setMessage({ type: 'err', text: result.error })
      return
    }

    const text = result.mailed
      ? 'Demande enregistrée. L’équipe a été notifiée par email.'
      : 'Demande enregistrée. Si besoin, contactez aussi via WhatsApp.'
    setMessage({ type: 'ok', text })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-base mb-1">
            Notifier l&apos;équipe depuis l&apos;app
          </h3>
          <p className="text-slate-500 text-sm">
            Enregistre une demande dans le tableau admin et envoie une alerte email à
            l&apos;équipe (sans remplacer WhatsApp pour la preuve de paiement).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleClick()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 shrink-0 rounded-xl bg-slate-900 hover:bg-slate-800
                     disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 text-sm transition-colors"
        >
          <Bell size={18} />
          {loading ? 'Envoi…' : 'Enregistrer ma demande Pro'}
        </button>
      </div>
      {message ? (
        <p
          className={`mt-4 text-sm rounded-xl px-4 py-3 border ${
            message.type === 'ok'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  )
}
