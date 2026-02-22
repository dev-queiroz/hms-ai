'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserSession } from '@/lib/types'

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Obter role do cookie (no client a gente precisaria do nookies ou ler document.cookie)
        // Por simplificação, estamos mockando o estado do client
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'admin'
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: any, session: any) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: 'admin'
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
