import { createSupabaseServer } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard'

    if (code) {
        const supabase = await createSupabaseServer()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Redirect to the next page (usually dashboard)
            return NextResponse.redirect(new URL(next, requestUrl.origin))
        }
    }

    // If there's an error or no code, redirect to login
    return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin))
}
