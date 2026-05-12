import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Composant client pour le chargement des données
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')

  // Dashboard ultra-léger - pas de requêtes Supabase côté serveur
  // Les données seront chargées côté client pour éviter les timeouts

  return <AdminDashboardClient />
}