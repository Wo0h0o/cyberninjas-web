import '@/app/globals.css'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background relative">
            {/* Aurora Background */}
            <div className="aurora">
                <div className="aurora-blob aurora-blob-1" />
                <div className="aurora-blob aurora-blob-2" />
                <div className="aurora-blob aurora-blob-3" />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
                {children}
            </div>
        </div>
    )
}
