import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client with improved settings
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'cyberninjas-auth',
        // Increased timeout for slower connections
        flowType: 'pkce',
    },
    global: {
        // Add headers for debugging
        headers: {
            'x-client-info': 'cyberninjas-web'
        }
    }
})

// Server-side client for API routes (no session persistence)
export function createServerClient() {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
        },
    })
}
