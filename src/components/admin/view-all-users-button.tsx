'use client'

import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ViewAllUsersButton() {
  const router = useRouter()

  const handleClick = () => {
    // Naviguer vers la page complète des utilisateurs
    router.push('/admin/users')
  }

  return (
    <button
      onClick={handleClick}
      className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 transition-colors"
      aria-label="Voir tous les utilisateurs détaillés"
    >
      Voir tout
      <ArrowRight size={14} aria-hidden="true" />
    </button>
  )
}
