import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'XAF') {
  if (currency === 'XAF') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).format(new Date(date))
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    cancelled: 'Annulée',
    accepted: 'Accepté',
    refused: 'Refusé',
  }
  return labels[status] || status
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    accepted: 'bg-green-100 text-green-700',
    refused: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}