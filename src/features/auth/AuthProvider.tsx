import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  /** True until the stored session has been checked. */
  loading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, session: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true })
  const queryClient = useQueryClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState((s) => ({ ...s, session: data.session, user: data.session?.user ?? null, loading: false }))
    })
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ session, user: session?.user ?? null, loading: false })
      // Never show one person's library to the next person on this device.
      if (event === 'SIGNED_OUT') queryClient.removeQueries({ queryKey: ['library'] })
    })
    return () => data.subscription.unsubscribe()
  }, [queryClient])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
