/**
 * Utilitaires de sécurité pour la prévention XSS et la validation des entrées
 */

/**
 * Nettoie une chaîne de caractères pour prévenir les attaques XSS
 * @param text - Texte à nettoyer
 * @returns Texte nettoyé
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return ''
  
  return text
    // Supprime les balises HTML potentiellement dangereuses
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '')
    // Échappe les caractères HTML spéciaux
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Supprime les événements JavaScript
    .replace(/on\w+\s*=/gi, '')
    // Supprime les protocoles javascript:
    .replace(/javascript:/gi, '')
    // Limite la longueur pour prévenir les attaques par buffer overflow
    .slice(0, 10000)
}

/**
 * Valide et nettoie les données d'un item de facture/devis
 * @param item - Données de l'item à valider
 * @returns Données validées et nettoyées
 */
export function validateAndSanitizeItem(item: {
  description: string
  quantity: number
  unit_price: number
}) {
  const sanitizedDescription = sanitizeText(item.description.trim())
  
  // Validation des nombres
  const quantity = Math.max(1, Math.min(999999, Number(item.quantity) || 1))
  const unitPrice = Math.max(0, Math.min(999999999, Number(item.unit_price) || 0))
  
  return {
    description: sanitizedDescription,
    quantity,
    unit_price: unitPrice,
    total: quantity * unitPrice
  }
}

/**
 * Valide le taux de TVA
 * @param taxRate - Taux de TVA à valider
 * @returns Taux de TVA validé
 */
export function validateTaxRate(taxRate: number): number {
  return Math.max(0, Math.min(100, Number(taxRate) || 0))
}

/**
 * Valide une devise
 * @param currency - Code de devise à valider
 * @returns Devise validée
 */
export function validateCurrency(currency: string): string {
  const allowedCurrencies = ['XAF', 'EUR', 'USD', 'GBP', 'CAD', 'CHF', 'JPY']
  return allowedCurrencies.includes(currency?.toUpperCase()) ? currency.toUpperCase() : 'XAF'
}

/**
 * Nettoie les notes d'une facture/devis
 * @param notes - Notes à nettoyer
 * @returns Notes nettoyées
 */
export function sanitizeNotes(notes: string): string | null {
  const sanitized = sanitizeText(notes.trim())
  return sanitized.length > 0 ? sanitized : null
}

/**
 * Valide et nettoie une URL pour les actions de notification
 * @param url - URL à valider
 * @returns URL validée ou null si invalide
 */
export function validateActionUrl(url: string | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  
  try {
    const parsedUrl = new URL(url, window.location.origin)
    
    // N'autoriser que les URLs relatives ou du même domaine
    if (parsedUrl.origin !== window.location.origin) {
      return null
    }
    
    // Nettoyer le chemin
    const cleanPath = sanitizeText(parsedUrl.pathname + parsedUrl.search)
    return cleanPath.startsWith('/') ? cleanPath : null
  } catch {
    return null
  }
}

/**
 * Valide et nettoie les données d'une notification
 * @param notification - Données de la notification à valider
 * @returns Notification validée et nettoyée
 */
export function validateAndSanitizeNotification(notification: {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  created_at: string
  read: boolean
  action_url?: string
}) {
  const allowedTypes = ['info', 'success', 'warning', 'error']
  
  return {
    id: sanitizeText(notification.id).slice(0, 50),
    type: allowedTypes.includes(notification.type) ? notification.type : 'info',
    title: sanitizeText(notification.title).slice(0, 100),
    message: sanitizeText(notification.message).slice(0, 500),
    created_at: sanitizeText(notification.created_at).slice(0, 50),
    read: Boolean(notification.read),
    action_url: validateActionUrl(notification.action_url)
  }
}

/**
 * Valide un ID de notification
 * @param id - ID à valider
 * @returns ID validé
 */
export function validateNotificationId(id: string): string {
  return sanitizeText(id).slice(0, 50).replace(/[^a-zA-Z0-9_-]/g, '')
}
