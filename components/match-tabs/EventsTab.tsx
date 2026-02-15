
"use client";

import { Activity, CreditCard, RotateCw, User, Flag, Shield } from "lucide-react";

interface EventsTabProps {
    eventsJson: string | null;
}

export default function EventsTab({ eventsJson }: EventsTabProps) {
    if (!eventsJson) {
        return (
            <div className="premium-card p-12 text-center bg-white dark:bg-slate-900 shadow-xl">
                <p className="text-slate-400 italic">No live events to display.</p>
            </div>
        );
    }

    let events: any[] = [];
    try {
        events = JSON.parse(eventsJson);
    } catch (e) {
        return <div className="p-4 text-red-500">Error loading events.</div>;
    }

    if (!events || events.length === 0) {
        return (
            <div className="premium-card p-12 text-center bg-white dark:bg-slate-900 shadow-xl">
                <p className="text-slate-400 italic">No events recorded yet.</p>
            </div>
        );
    }

    // Filter to important events
    const validEvents = events.filter(e =>
        ['Goal', 'Card', 'subst'].includes(e.type)
    );

    const getIcon = (type: string, detail: string) => {
        if (type === 'Goal') return <Activity className="w-4 h-4 text-green-500" />;
        if (type === 'Card') {
            if (detail.includes('Yellow')) return <div className="w-3 h-4 bg-yellow-400 rounded-sm shadow-sm" />;
            if (detail.includes('Red')) return <div className="w-3 h-4 bg-red-600 rounded-sm shadow-sm" />;
        }
        if (type === 'subst') return <RotateCw className="w-4 h-4 text-blue-500" />;
        return <Flag className="w-4 h-4 text-slate-400" />;
    };

    return (
        <div className="premium-card p-8 md:p-12 bg-white dark:bg-slate-900 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <h3 className="text-base font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Match Timeline
            </h3>

            <div className="space-y-0 relative before:absolute before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-slate-100 dark:before:bg-slate-800 before:-translate-x-1/2">
                {validEvents.map((event, idx) => {
                    const isHome = !event.team.logo; // This logic might need adjustment depending on API data, usually we compare team ID
                    // Assuming we don't have team IDs easily here without more context, let's just rely on UI passing team names or IDs? 
                    // Actually, let's just use CSS classes based on side if we knew. 
                    // For now, let's just assume we can determine side by event.team.id if passed, or just list them.
                    // A better way is to style strictly based on the team.

                    return (
                        <div key={idx} className="relative flex items-center mb-8 last:mb-0 group">
                            {/* Time Badge - Center */}
                            <div className="absolute left-1/2 -translate-x-1/2 z-10">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 flex items-center justify-center text-[10px] font-black shadow-lg group-hover:scale-110 transition-transform">
                                    {event.time.elapsed}'
                                </div>
                            </div>

                            {/* Event Content */}
                            <div className={`w-1/2 px-8 flex flex-col justify-center ${idx % 2 === 0 ? 'items-end text-right pr-12' : 'items-start text-left pl-12 ml-auto'}`}>
                                <div className={`flex items-center gap-3 ${idx % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                                        {getIcon(event.type, event.detail)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">{event.player.name}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{event.detail}</span>
                                    </div>
                                </div>
                                {event.assist.name && (
                                    <div className={`mt-1 text-[8px] font-medium text-slate-400 flex items-center gap-1 ${idx % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Asst. {event.assist.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {validEvents.length === 0 && (
                    <div className="text-center py-8">
                        <span className="text-xs font-bold text-slate-400 uppercase">No major events yet</span>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-6">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                    <Activity className="w-3 h-3 text-green-500" /> Goal
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                    <div className="w-2 h-3 bg-yellow-400 rounded-sm" /> Yellow Card
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                    <div className="w-2 h-3 bg-red-600 rounded-sm" /> Red Card
                </div>
            </div>
        </div>
    );
}
