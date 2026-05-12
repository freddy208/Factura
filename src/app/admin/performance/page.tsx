import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { AdminPerformancePageClient } from '@/components/admin/AdminPerformancePageClient'

export default async function AdminPerformancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  const adminClient = createAdminClient()

  // Récupération des données pour les métriques
  let profiles: any[] | null = null
  let invoices: any[] | null = null
  let clients: any[] | null = null
  
  try {
    const [
      profilesPromise,
      invoicesPromise,
      clientsPromise
    ] = [
      adminClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }),
      
      adminClient
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000),
      
      adminClient
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)
    ]

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 8000)
    )

    const [
      profilesResult,
      invoicesResult,
      clientsResult
    ] = await Promise.all([
      Promise.race([profilesPromise, timeoutPromise]),
      Promise.race([invoicesPromise, timeoutPromise]),
      Promise.race([clientsPromise, timeoutPromise])
    ])

    profiles = (profilesResult as any)?.data || []
    invoices = (invoicesResult as any)?.data || []
    clients = (clientsResult as any)?.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des métriques:', error)
    profiles = []
    invoices = []
    clients = []
  }

  // Métriques système (simulées pour l'exemple)
  const systemMetrics = {
    cpu: {
      usage: Math.floor(Math.random() * 30) + 20, // 20-50%
      cores: 4,
      temperature: Math.floor(Math.random() * 20) + 45, // 45-65°C
      status: 'normal'
    },
    memory: {
      used: Math.floor(Math.random() * 4096) + 2048, // 2-6GB
      total: 8192, // 8GB total
      percentage: Math.floor(Math.random() * 40) + 30, // 30-70%
      status: 'normal'
    },
    disk: {
      used: Math.floor(Math.random() * 50000) + 20000, // 20-70GB
      total: 100000, // 100GB total
      percentage: Math.floor(Math.random() * 50) + 20, // 20-70%
      status: 'normal'
    },
    database: {
      connections: Math.floor(Math.random() * 50) + 10, // 10-60 connections
      maxConnections: 100,
      queryTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
      status: 'normal'
    },
    network: {
      bandwidth: Math.floor(Math.random() * 1000) + 500, // 500-1500 Mbps
      latency: Math.floor(Math.random() * 50) + 10, // 10-60ms
      uptime: 99.9,
      status: 'normal'
    }
  }

  // Métriques d'utilisation
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const activeUsers24h = profiles?.filter((p: any) => {
    const userInvoices = invoices?.filter((inv: any) => inv.user_id === p.id) || []
    const lastActivity = userInvoices.length > 0 ? 
      new Date(Math.max(...userInvoices.map((inv: any) => new Date(inv.created_at).getTime()))) : 
      null
    return lastActivity && lastActivity >= last24h
  }).length || 0

  const activeUsers7d = profiles?.filter((p: any) => {
    const userInvoices = invoices?.filter((inv: any) => inv.user_id === p.id) || []
    const lastActivity = userInvoices.length > 0 ? 
      new Date(Math.max(...userInvoices.map((inv: any) => new Date(inv.created_at).getTime()))) : 
      null
    return lastActivity && lastActivity >= last7d
  }).length || 0

  const activeUsers30d = profiles?.filter((p: any) => {
    const userInvoices = invoices?.filter((inv: any) => inv.user_id === p.id) || []
    const lastActivity = userInvoices.length > 0 ? 
      new Date(Math.max(...userInvoices.map((inv: any) => new Date(inv.created_at).getTime()))) : 
      null
    return lastActivity && lastActivity >= last30d
  }).length || 0

  // Métriques de performance
  const invoices24h = invoices?.filter((inv: any) => new Date(inv.created_at) >= last24h).length || 0
  const invoices7d = invoices?.filter((inv: any) => new Date(inv.created_at) >= last7d).length || 0
  const invoices30d = invoices?.filter((inv: any) => new Date(inv.created_at) >= last30d).length || 0

  const avgResponseTime = Math.floor(Math.random() * 200) + 100 // 100-300ms
  const errorRate = Math.floor(Math.random() * 2) // 0-2%
  const throughput = Math.floor(Math.random() * 1000) + 500 // 500-1500 req/min

  // Données pour graphiques (simulation)
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    requests: Math.floor(Math.random() * 1000) + 200,
    errors: Math.floor(Math.random() * 20),
    responseTime: Math.floor(Math.random() * 100) + 50
  }))

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      users: Math.floor(Math.random() * 100) + 50,
      invoices: Math.floor(Math.random() * 50) + 20,
      revenue: Math.floor(Math.random() * 5000) + 1000
    }
  })

  return (
    <AdminPerformancePageClient
      profiles={profiles || []}
      invoices={invoices || []}
      clients={clients || []}
      systemMetrics={systemMetrics}
      activeUsers24h={activeUsers24h}
      activeUsers7d={activeUsers7d}
      activeUsers30d={activeUsers30d}
      invoices24h={invoices24h}
      invoices7d={invoices7d}
      invoices30d={invoices30d}
      avgResponseTime={avgResponseTime}
      errorRate={errorRate}
      throughput={throughput}
      hourlyData={hourlyData}
      dailyData={dailyData}
    />
  )
}
