import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NotificationsList from '@/components/notifications/NotificationsList'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <NotificationsList />
}
