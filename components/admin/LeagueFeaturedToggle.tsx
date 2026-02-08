"use client";

import { useState, useTransition } from "react";
import { toggleLeagueFeatured } from "@/lib/actions/league-actions";
import { Star } from "lucide-react";

export default function LeagueFeaturedToggle({ leagueId, initialStatus }: { leagueId: string, initialStatus: boolean }) {
    const [isFeatured, setIsFeatured] = useState(initialStatus);
    const [isPending, startTransition] = useTransition();

    const handleToggle = async () => {
        const newStatus = !isFeatured;
        setIsFeatured(newStatus);

        startTransition(async () => {
            const result = await toggleLeagueFeatured(leagueId, newStatus);
            if (result.error) {
                setIsFeatured(!newStatus);
                alert("Failed to update status");
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`p-2 rounded-lg transition-all ${isFeatured ? 'text-yellow-500 bg-yellow-50' : 'text-slate-300 hover:text-slate-400 bg-slate-50'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isFeatured ? "Featured in Navbar" : "Not Featured"}
        >
            <Star className={`w-4 h-4 ${isFeatured ? 'fill-yellow-500' : ''}`} />
        </button>
    );
}
