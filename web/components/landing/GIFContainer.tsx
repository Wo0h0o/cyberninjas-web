"use client";

interface GIFContainerProps {
    src: string;
    alt: string;
    aspectRatio?: "video" | "square" | "portrait";
    fadeHeight?: number; // pixels to fade at bottom
    className?: string;
}

export default function GIFContainer({
    src,
    alt,
    aspectRatio = "video",
    fadeHeight = 80,
    className = "",
}: GIFContainerProps) {
    const aspectRatioValues = {
        video: "16/9",
        square: "1/1",
        portrait: "9/16",
    };

    return (
        <div className={`gif-wrapper relative ${className}`}>
            <div
                className="gif-container w-full rounded-2xl overflow-hidden"
                style={{
                    aspectRatio: aspectRatioValues[aspectRatio],
                    background:
                        "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(217, 70, 239, 0.1))",
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    style={{
                        maskImage: `linear-gradient(to bottom, black ${100 - (fadeHeight / 400) * 100
                            }%, transparent 100%)`,
                        WebkitMaskImage: `linear-gradient(to bottom, black ${100 - (fadeHeight / 400) * 100
                            }%, transparent 100%)`,
                    }}
                />
            </div>
        </div>
    );
}
