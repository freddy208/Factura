'use client'

import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ClientRecord = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  address: string | null
  created_at: string
}

export function useClients() {
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setClients([])
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('id, name, email, phone, company, address, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      setClients((data as ClientRecord[] | null) ?? [])
      setLoading(false)
    } catch {
      setError('Impossible de charger les clients.')
      setLoading(false)
    }
  }, [])

  return {
    clients,
    loading,
    error,
    fetchClients,
  }
}
