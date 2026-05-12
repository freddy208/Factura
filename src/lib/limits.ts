/**
 * Limites et quotas pour les différents plans d'abonnement
 * Centralisées pour garantir la cohérence dans toute l'application
 */

export const PLAN_LIMITS = {
  free: {
    invoices_per_month: 5,
    quotes_per_month: 5,
    clients_total: 10,
    storage_gb: 1,
    users: 1
  },
  pro: {
    invoices_per_month: Infinity,
    quotes_per_month: Infinity,
    clients_total: Infinity,
    storage_gb: 50,
    users: 3
  }
} as const

export const PLAN_PRICING = {
  free: {
    monthly_eur: 0,
    monthly_fcfa: 0
  },
  pro: {
    monthly_eur: 29,
    monthly_fcfa: 2500
  }
} as const

export type PlanType = keyof typeof PLAN_LIMITS

/**
 * Vérifie si un utilisateur free a atteint ses limites mensuelles
 */
export function checkUserLimits(
  plan: PlanType,
  currentInvoices: number,
  currentQuotes: number,
  currentClients: number
) {
  const limits = PLAN_LIMITS[plan]
  
  return {
    invoices: {
      current: currentInvoices,
      limit: limits.invoices_per_month,
      isNearLimit: currentInvoices >= limits.invoices_per_month - 1,
      isOverLimit: currentInvoices > limits.invoices_per_month,
      remaining: Math.max(0, limits.invoices_per_month - currentInvoices)
    },
    quotes: {
      current: currentQuotes,
      limit: limits.quotes_per_month,
      isNearLimit: currentQuotes >= limits.quotes_per_month - 1,
      isOverLimit: currentQuotes > limits.quotes_per_month,
      remaining: Math.max(0, limits.quotes_per_month - currentQuotes)
    },
    clients: {
      current: currentClients,
      limit: limits.clients_total,
      isNearLimit: currentClients >= limits.clients_total - 1,
      isOverLimit: currentClients > limits.clients_total,
      remaining: Math.max(0, limits.clients_total - currentClients)
    }
  }
}

/**
 * Calcule les statistiques mensuelles d'un utilisateur
 */
export function calculateMonthlyStats(
  invoices: any[],
  userId: string,
  targetMonth?: Date
) {
  const month = targetMonth || new Date()
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  
  const userInvoices = invoices.filter(inv => inv.user_id === userId)
  const monthlyInvoices = userInvoices.filter(inv => {
    const invDate = new Date(inv.created_at)
    return invDate >= monthStart && invDate <= monthEnd
  })
  
  return {
    invoices: monthlyInvoices.filter(inv => inv.type === 'invoice').length,
    quotes: monthlyInvoices.filter(inv => inv.type === 'quote').length,
    paidInvoices: monthlyInvoices.filter(inv => inv.type === 'invoice' && inv.status === 'paid').length,
    revenue: monthlyInvoices
      .filter(inv => inv.type === 'invoice' && inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0),
    month: month,
    monthStart,
    monthEnd
  }
}
