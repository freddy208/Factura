'use client'

import { useState, useEffect } from 'react'

/**
 * Hook pour éviter les erreurs d'hydration en attendant que le composant soit monté côté client
 * Retourne true uniquement côté client, jamais côté serveur
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook pour gérer l'état de localStorage avec hydration safety
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const isClient = useIsClient()
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    if (!isClient) return

    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        // Nettoyer l'item avant de le parser
        const cleanedItem = item.trim()
        
        // Vérifier si l'item est du JSON valide
        try {
          const parsed = JSON.parse(cleanedItem)
          setStoredValue(parsed)
        } catch (parseError) {
          // Si le parsing échoue, essayer de traiter comme une chaîne simple
          // Nettoyer aussi les caractères invalides potentiels
          const cleanString = cleanedItem.replace(/[^\x20-\x7E]/g, '').trim()
          if (cleanString) {
            setStoredValue(cleanString as any)
          } else {
            // Si après nettoyage il n'y a plus rien, utiliser la valeur initiale
            setStoredValue(initialValue)
            // Retirer la clé corrompue du localStorage
            try {
              window.localStorage.removeItem(key)
            } catch (removeError) {
              // Ignorer l'erreur de suppression
            }
          }
        }
      }
    } catch (error) {
      // Seulement logger l'erreur si c'est une erreur critique (pas de parsing JSON)
      if (!(error instanceof SyntaxError)) {
        console.warn(`Error reading localStorage key "${key}":`, error)
      }
      // En cas d'erreur, utiliser la valeur initiale
      setStoredValue(initialValue)
    }
  }, [key, isClient])

  const setValue = (value: T | ((val: T) => T)) => {
    if (!isClient) return

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

/**
 * Hook pour gérer l'état en ligne avec hydration safety
 */
export function useOnlineStatus() {
  const isClient = useIsClient()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (!isClient) return

    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    
    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [isClient])

  return isOnline
}
