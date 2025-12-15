'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error: Error | null }>
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const initAttempted = useRef(false)

    // Fetch profile from database with retry
    const fetchProfile = useCallback(async (userId: string, retryCount = 0): Promise<void> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                // Retry once on error
                if (retryCount < 1) {
                    console.log('AuthContext: Retrying profile fetch...')
                    await new Promise(r => setTimeout(r, 500))
                    return fetchProfile(userId, retryCount + 1)
                }
                throw error
            }
            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
            setProfile(null)
        }
    }, [])

    // Initialize auth state - runs once
    useEffect(() => {
        // Prevent double initialization in React StrictMode
        if (initAttempted.current) return
        initAttempted.current = true

        let isMounted = true
        let safetyTimeoutId: NodeJS.Timeout

        const initAuth = async () => {
            console.log('AuthContext: Starting initAuth...')

            // Safety timeout - if auth takes too long, stop loading anyway
            safetyTimeoutId = setTimeout(() => {
                if (isMounted && loading) {
                    console.warn('AuthContext: Safety timeout triggered after 8s')
                    setLoading(false)
                }
            }, 8000)

            try {
                // Try to get session from storage first
                const { data: { session }, error } = await supabase.auth.getSession()

                clearTimeout(safetyTimeoutId)

                if (error) {
                    console.error('AuthContext: Session error:', error)
                }

                if (isMounted) {
                    console.log('AuthContext: Got session:', !!session)
                    setSession(session)
                    setUser(session?.user ?? null)

                    if (session?.user) {
                        console.log('AuthContext: Fetching profile...')
                        await fetchProfile(session.user.id)
                        console.log('AuthContext: Profile fetched')
                    }

                    setLoading(false)
                }
            } catch (error) {
                clearTimeout(safetyTimeoutId)
                console.error('AuthContext: Error initializing auth:', error)
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        initAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('AuthContext: Auth state changed:', event)
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }

                // Ensure loading is false after any auth event
                setLoading(false)
            }
        )

        return () => {
            isMounted = false
            clearTimeout(safetyTimeoutId)
            subscription.unsubscribe()
        }
    }, [fetchProfile])

    const signIn = async (email: string, password: string) => {
        try {
            console.log('AuthContext: Attempting sign in...')

            // Add timeout to prevent hanging
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 15000)

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            clearTimeout(timeoutId)
            console.log('AuthContext: Sign in result:', { error: error?.message })

            if (error) throw error
            return { error: null }
        } catch (error) {
            console.error('AuthContext: Sign in error:', error)
            return { error: error as Error }
        }
    }

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                    },
                },
            })
            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
        } finally {
            // Always clear local state even if signOut fails
            setUser(null)
            setProfile(null)
            setSession(null)
        }
    }

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return { error: new Error('Not authenticated') }

        try {
            const { error } = await supabase
                .from('profiles')
                // eslint-disable-next-line
                .update(updates as never)
                .eq('id', user.id)

            if (error) throw error

            // Refresh profile
            await fetchProfile(user.id)
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                loading,
                signIn,
                signUp,
                signOut,
                resetPassword,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
