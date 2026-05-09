import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  type ProfileResult = {
    full_name: string | null
    company_name: string | null
    plan: 'free' | 'pro'
    email: string
  }

  const profile = profileData as ProfileResult | null

  return (
    <DashboardShell profile={profile}>{children}</DashboardShell>
  )
}