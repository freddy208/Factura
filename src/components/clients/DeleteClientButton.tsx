'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePremiumModal } from '@/hooks/usePremiumModal'

export default function DeleteClientButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { confirm, alert, setLoading: setModalLoading, ModalComponent } = usePremiumModal()

  async function handleDelete() {
    const confirmed = await confirm(
      'Supprimer le client',
      'Supprimer ce client ? Cette action est irréversible.',
      'danger',
      { confirmText: 'Supprimer', cancelText: 'Annuler' }
    )
    if (!confirmed) return

    setLoading(true)
    setModalLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from('clients').delete().eq('id', clientId)
      if (deleteError) {
        await alert('Erreur de suppression', 'Suppression impossible. Veuillez réessayer.', 'danger')
        setModalLoading(false)
        setLoading(false)
        return
      }
      window.location.href = '/clients'
    } catch {
      await alert('Erreur inattendue', 'Une erreur inattendue est survenue.', 'danger')
      setModalLoading(false)
      setLoading(false)
    }
  }

  return (
    <>
      <ModalComponent />
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          title="Supprimer ce client"
          aria-label="Supprimer ce client"
        >
          <Trash2 size={16} />
        </button>
        {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
      </div>
    </>
  )
}
