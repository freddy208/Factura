/**
 * Utilitaires de validation et de sanitization pour sécuriser les entrées utilisateur
 */

// Regex pour validation
const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  name: /^[\p{L}\p{M}\s\-\.'']+$/u,
  alphanumeric: /^[\p{L}\p{M}\p{N}\s\-\.'']+$/u
}

// Caractères dangereux à échapper ou supprimer
const DANGEROUS_CHARS = /[<>\"'&]/g

/**
 * Sanitize une chaîne de caractères pour prévenir les attaques XSS
 */
export function sanitizeString(input: string): string {
  if (!input) return ''
  
  return input
    .trim()
    .replace(DANGEROUS_CHARS, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return escapeMap[char] || char
    })
    .substring(0, 500) // Limiter la longueur
}

/**
 * Valide et sanitize un nom
 */
export function validateName(name: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, sanitized: '', error: 'Le nom est requis' }
  }
  
  const sanitized = sanitizeString(name)
  
  if (sanitized.length < 2) {
    return { isValid: false, sanitized, error: 'Le nom doit contenir au moins 2 caractères' }
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, sanitized, error: 'Le nom ne peut pas dépasser 100 caractères' }
  }
  
  if (!REGEX.name.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Le nom contient des caractères non valides' }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Valide et sanitize un email
 */
export function validateEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!email || email.trim().length === 0) {
    return { isValid: true, sanitized: '', error: undefined } // Email optionnel
  }
  
  const sanitized = sanitizeString(email.toLowerCase())
  
  if (sanitized.length > 255) {
    return { isValid: false, sanitized, error: 'L\'email ne peut pas dépasser 255 caractères' }
  }
  
  if (!REGEX.email.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Format d\'email invalide' }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Valide et sanitize un numéro de téléphone
 */
export function validatePhone(phone: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { isValid: true, sanitized: '', error: undefined } // Téléphone optionnel
  }
  
  const sanitized = sanitizeString(phone)
  
  if (sanitized.length < 10) {
    return { isValid: false, sanitized, error: 'Le numéro de téléphone doit contenir au moins 10 chiffres' }
  }
  
  if (sanitized.length > 20) {
    return { isValid: false, sanitized, error: 'Le numéro de téléphone ne peut pas dépasser 20 caractères' }
  }
  
  if (!REGEX.phone.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Format de téléphone invalide' }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Valide et sanitize une entreprise
 */
export function validateCompany(company: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!company || company.trim().length === 0) {
    return { isValid: true, sanitized: '', error: undefined } // Optionnel
  }
  
  const sanitized = sanitizeString(company)
  
  if (sanitized.length < 2) {
    return { isValid: false, sanitized, error: 'Le nom de l\'entreprise doit contenir au moins 2 caractères' }
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, sanitized, error: 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères' }
  }
  
  if (!REGEX.alphanumeric.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Le nom de l\'entreprise contient des caractères non valides' }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Valide et sanitize une adresse
 */
export function validateAddress(address: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!address || address.trim().length === 0) {
    return { isValid: true, sanitized: '', error: undefined } // Optionnel
  }
  
  const sanitized = sanitizeString(address)
  
  if (sanitized.length < 5) {
    return { isValid: false, sanitized, error: 'L\'adresse doit contenir au moins 5 caractères' }
  }
  
  if (sanitized.length > 255) {
    return { isValid: false, sanitized, error: 'L\'adresse ne peut pas dépasser 255 caractères' }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Rate limiting simple pour prévenir les attaques brute force
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)
    
    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }
    
    // Réinitialiser si la fenêtre est expirée
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }
    
    // Vérifier si le nombre maximum de tentatives est dépassé
    if (record.count >= this.maxAttempts) {
      return false
    }
    
    // Incrémenter le compteur
    record.count++
    record.lastAttempt = now
    return true
  }
  
  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record) return this.maxAttempts
    return Math.max(0, this.maxAttempts - record.count)
  }
  
  getResetTime(identifier: string): number | null {
    const record = this.attempts.get(identifier)
    if (!record || record.count < this.maxAttempts) return null
    return record.lastAttempt + this.windowMs
  }
}
