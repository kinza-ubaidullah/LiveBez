"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield } from "lucide-react";

interface SmartLogoProps {
    src?: string | null;
    alt: string;
    width: number;
    height: number;
    className?: string;
}

export default function SmartLogo({ src, alt, width, height, className = "" }: SmartLogoProps) {
    const [error, setError] = useState(false);

    const fallbackText = alt.slice(0, 1).toUpperCase();

    if (!src || error) {
        return (
            <div
                style={{ width, height }}
                className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}
            >
                <div className="flex flex-col items-center">
                    <span className="text-blue-600 font-black text-xl italic">{fallbackText}</span>
                    <span className="text-[6px] font-black uppercase tracking-tighter opacity-40">{alt}</span>
                </div>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`${className} transition-opacity duration-300 ${error ? 'opacity-0' : 'opacity-100'}`}
            onError={() => setError(true)}
            unoptimized={src.includes('.svg') || src.includes('.gif')}
        />
    );
}
