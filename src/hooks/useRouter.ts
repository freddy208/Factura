'use client'

import { useRouter } from 'next/navigation'
import { useIsClient } from './useIsClient'

/**
 * Hook pour gérer les redirections avec hydration safety
 */
export function useSafeRouter() {
  const router = useRouter()
  const isClient = useIsClient()

  return {
    push: (href: string) => {
      if (!isClient) return
      router.push(href)
    },
    replace: (href: string) => {
      if (!isClient) return
      router.replace(href)
    },
    back: () => {
      if (!isClient) return
      router.back()
    },
    refresh: () => {
      if (!isClient) return
      router.refresh()
    },
    // Pour les redirections après logout (besoin de recharger la page)
    redirect: (href: string) => {
      if (!isClient) return
      window.location.href = href
    }
  }
}
