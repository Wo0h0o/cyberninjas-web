'use client'

export function LoginAnimation() {
    return (
        <div className="relative w-full h-full flex items-center justify-end">
            {/* Video aligned to the right */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full object-contain"
            >
                <source src="/videos/PRELIVANE.mp4" type="video/mp4" />
            </video>
        </div>
    )
}
