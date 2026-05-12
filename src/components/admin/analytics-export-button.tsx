'use client'

import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { useState } from 'react'

interface AnalyticsExportButtonProps {
  data: {
    profiles: any[] | null
    invoices: any[] | null
    clients: any[] | null
    topUsersByRevenue: any[]
    monthlyData: any[]
    totalUsers: number
    totalRevenue: number
    totalInvoices: number
    totalQuotes: number
    totalClients: number
  }
}

export function AnalyticsExportButton({ data }: AnalyticsExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')

  const exportToCSV = () => {
    setIsExporting(true)
    
    try {
      // Créer le contenu CSV
      const headers = [
        'Métrique',
        'Valeur',
        'Description'
      ]
      
      const rows = [
        ['Utilisateurs totaux', data.totalUsers.toString(), 'Nombre total d\'utilisateurs inscrits'],
        ['Revenus totaux', data.totalRevenue.toString() + '€', 'Somme des revenus générés'],
        ['Factures totales', data.totalInvoices.toString(), 'Nombre total de factures émises'],
        ['Devis totaux', data.totalQuotes.toString(), 'Nombre total de devis créés'],
        ['Clients totaux', data.totalClients.toString(), 'Nombre total de clients enregistrés'],
        ['Utilisateurs Pro', data.topUsersByRevenue.filter(u => u.plan === 'pro').length.toString(), 'Nombre d\'utilisateurs avec plan Pro'],
        ['Utilisateurs Free', (data.totalUsers - data.topUsersByRevenue.filter(u => u.plan === 'pro').length).toString(), 'Nombre d\'utilisateurs avec plan Free']
      ]

      // Ajouter les données mensuelles
      data.monthlyData.forEach((month: any) => {
        rows.push([`Factures ${month.month}`, month.invoices.toString(), `Factures émises en ${month.month}`])
        rows.push([`Revenus ${month.month}`, month.revenue.toString() + '€', `Revenus générés en ${month.month}`])
        rows.push([`Utilisateurs ${month.month}`, month.users.toString(), `Utilisateurs actifs en ${month.month}`])
      })

      // Ajouter les top utilisateurs
      data.topUsersByRevenue.forEach((user: any, index: number) => {
        rows.push([
          `Top ${index + 1} - ${user.company_name || user.email}`,
          `${user.revenue}€ (${user.invoiceCount} factures)`,
          `Plan: ${user.plan === 'pro' ? 'Pro' : 'Free'}`
        ])
      })

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToJSON = () => {
    setIsExporting(true)
    
    try {
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalUsers: data.totalUsers,
          totalRevenue: data.totalRevenue,
          totalInvoices: data.totalInvoices,
          totalQuotes: data.totalQuotes,
          totalClients: data.totalClients
        },
        monthlyData: data.monthlyData,
        topUsers: data.topUsersByRevenue,
        summary: {
          proUsers: data.topUsersByRevenue.filter(u => u.plan === 'pro').length,
          freeUsers: data.totalUsers - data.topUsersByRevenue.filter(u => u.plan === 'pro').length,
          averageRevenuePerUser: data.totalUsers > 0 ? data.totalRevenue / data.totalUsers : 0
        }
      }

      const jsonContent = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erreur lors de l\'export JSON:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV()
    } else {
      exportToJSON()
    }
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleExport}
        disabled={isExporting}
        aria-label={`Exporter les analytics au format ${exportFormat.toUpperCase()}`}
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <span className="text-sm font-medium">Export...</span>
          </>
        ) : (
          <>
            <Download size={16} aria-hidden="true" />
            <span className="text-sm font-medium">Exporter</span>
          </>
        )}
      </button>
      
      <div className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 min-w-[150px] z-10">
        <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
          <input
            type="radio"
            name="format"
            value="csv"
            checked={exportFormat === 'csv'}
            onChange={(e) => setExportFormat(e.target.value as 'csv')}
            className="text-blue-600 focus:ring-blue-500"
          />
          <FileSpreadsheet size={16} className="text-slate-600" />
          <span className="text-sm">CSV</span>
        </label>
        <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
          <input
            type="radio"
            name="format"
            value="json"
            checked={exportFormat === 'json'}
            onChange={(e) => setExportFormat(e.target.value as 'json')}
            className="text-blue-600 focus:ring-blue-500"
          />
          <FileText size={16} className="text-slate-600" />
          <span className="text-sm">JSON</span>
        </label>
      </div>
    </div>
  )
}
