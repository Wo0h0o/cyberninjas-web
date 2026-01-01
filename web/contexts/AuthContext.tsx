'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
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
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch profile from database with timeout
    const fetchProfile = useCallback(async (userId: string): Promise<void> => {
        console.log('AuthContext: Starting profile fetch for', userId)

        // Increased timeout to 15s to handle slow connections
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Profile fetch timeout after 15s')), 15000)
        })

        try {
            const fetchPromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            // Race between fetch and timeout
            const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

            if (error) {
                console.error('AuthContext: Profile fetch error:', error)
                console.warn('Continuing without profile - app will still function')
                setProfile(null)
                return
            }
            console.log('AuthContext: Profile data received:', !!data)
            setProfile(data)
        } catch (error) {
            console.error('AuthContext: Profile fetch failed:', error)
            console.warn('Continuing without profile - user can still access app')
            setProfile(null)
        }
    }, [])

    // Initialize auth state - simple version without complex timeouts
    useEffect(() => {
        let isMounted = true

        const initAuth = async () => {
            console.log('AuthContext: Initializing...')

            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('AuthContext: Get session error:', error)
                }

                if (isMounted) {
                    console.log('AuthContext: Session found:', !!session)
                    setSession(session)
                    setUser(session?.user ?? null)

                    if (session?.user) {
                        await fetchProfile(session.user.id)
                    }

                    setLoading(false)
                    console.log('AuthContext: Init complete')
                }
            } catch (error) {
                console.error('AuthContext: Init error:', error)
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

                if (!isMounted) return

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    // Fetch profile without blocking (fire and forget)
                    fetchProfile(session.user.id)
                        .catch(err => console.warn('Profile fetch failed, continuing:', err))
                } else {
                    setProfile(null)
                }

                setLoading(false)
            }
        )

        return () => {
            isMounted = false
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

    // Wrapper for refreshing profile  
    const refreshProfile = useCallback(async () => {
        if (user?.id) {
            await fetchProfile(user.id)
        }
    }, [user, fetchProfile])

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
                refreshProfile,
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
