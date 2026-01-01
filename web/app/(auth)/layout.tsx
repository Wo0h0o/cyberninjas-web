'use client'

import '@/app/globals.css'
import { LoginAnimation } from '@/components/auth/LoginAnimation'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden">
            {/* Split Layout Container */}
            <div className="h-screen flex overflow-hidden">
                {/* Left Side - Form */}
                <div className="w-full lg:w-[45%] min-h-screen flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>

                {/* Right Side - Animation (hidden on mobile) */}
                <div className="hidden lg:flex w-[55%] h-screen bg-gradient-to-br from-black via-gray-900/50 to-black relative overflow-hidden">
                    {/* Subtle grid pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(255, 255, 0, 0.03) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255, 255, 0, 0.03) 1px, transparent 1px)
                            `,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Gradient fade on left edge for blending */}
                    <div className="absolute left-0 inset-y-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />

                    {/* Animation */}
                    <LoginAnimation />
                </div>
            </div>
        </div>
    )
}
