import { createServerClient as createServerClientSSR, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './types'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Create a simple Supabase client for public read operations (no auth needed)
 * Use this for GET endpoints that don't require user authentication
 */
export function createSupabaseAnon() {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
        },
    })
}

/**
 * Create a Supabase client for Server Components and API Routes
 * This reads cookies from the request to get the user session
 */
export async function createSupabaseServer() {
    const cookieStore = await cookies()

    return createServerClientSSR<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing sessions.
                    }
                },
            },
        }
    )
}

/**
 * Create a Supabase client authenticated via Authorization header Bearer token
 * This is more reliable for API routes than cookie-based auth
 */
export async function createSupabaseWithToken(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
        return { supabase: null, user: null, error: 'No authorization token' }
    }

    // Create a client with the access token
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
        },
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    })

    // Verify the token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
        return { supabase: null, user: null, error: error?.message || 'Invalid token' }
    }

    return { supabase, user, error: null }
}
