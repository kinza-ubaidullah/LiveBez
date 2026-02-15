
"use client";

interface StandingsTabProps {
    standingsJson: string | null;
    homeTeamName?: string;
    awayTeamName?: string;
}

export default function StandingsTab({ standingsJson, homeTeamName, awayTeamName }: StandingsTabProps) {
    if (!standingsJson) {
        return (
            <div className="premium-card p-12 text-center bg-white dark:bg-slate-900 shadow-xl">
                <p className="text-slate-400 italic">Standings not available.</p>
            </div>
        );
    }

    let standings: any[] = [];
    try {
        const parsed = JSON.parse(standingsJson);
        // api-sports returns nested array [ [ { rank: 1... } ] ] logic sometimes, or just [ { rank... } ]
        // Usually response[0].league.standings which is an array of arrays (groups)
        // Adjust based on typical structure: parsed[0] might be the league object
        // Let's assume parsed is the array of standings entries directly or the league object
        // If it's the full response from API-Sports getStandings: response[0].league.standings[0]

        if (Array.isArray(parsed)) {
            // If it's the raw standings array
            standings = parsed;
        } else if (parsed.league && parsed.league.standings) {
            standings = parsed.league.standings[0];
        } else if (parsed[0]?.league?.standings) {
            standings = parsed[0].league.standings[0];
        }
    } catch (e) {
        return <div className="p-4 text-red-500">Error loading standings.</div>;
    }

    if (!standings || standings.length === 0) {
        return (
            <div className="premium-card p-12 text-center bg-white dark:bg-slate-900 shadow-xl">
                <p className="text-slate-400 italic">No standings data found.</p>
            </div>
        );
    }

    return (
        <div className="premium-card p-6 md:p-8 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            <h3 className="text-base font-black uppercase tracking-widest mb-6">League Table</h3>

            <div className="overflow-x-auto">
                <table className="w-full text-[10px] md:text-xs">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="py-3 px-2 text-left font-black text-slate-400 uppercase tracking-widest w-10">#</th>
                            <th className="py-3 px-2 text-left font-black text-slate-400 uppercase tracking-widest">Team</th>
                            <th className="py-3 px-2 text-center font-black text-slate-400 uppercase tracking-widest w-8">MP</th>
                            <th className="py-3 px-2 text-center font-black text-slate-400 uppercase tracking-widest w-8">W</th>
                            <th className="py-3 px-2 text-center font-black text-slate-400 uppercase tracking-widest w-8">D</th>
                            <th className="py-3 px-2 text-center font-black text-slate-400 uppercase tracking-widest w-8">L</th>
                            <th className="py-3 px-2 text-center font-black text-slate-400 uppercase tracking-widest w-8">GF</th>
                            <th className="py-3 px-2 text-center font-black text-slate-400 uppercase tracking-widest w-8">GA</th>
                            <th className="py-3 px-2 text-center font-black text-slate-400 uppercase tracking-widest w-8">GD</th>
                            <th className="py-3 px-2 text-center font-black text-slate-900 dark:text-white uppercase tracking-widest w-10">Pts</th>
                            <th className="py-3 px-2 text-center font-black text-slate-400 uppercase tracking-widest w-20">Form</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((team: any) => {
                            const teamName = team?.team?.name;
                            const isHome = homeTeamName && teamName === homeTeamName;
                            const isAway = awayTeamName && teamName === awayTeamName;
                            const isHighlighted = isHome || isAway;

                            if (!team?.team) return null;

                            return (
                                <tr
                                    key={team.team.id}
                                    className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors ${isHighlighted ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                        }`}
                                >
                                    <td className="py-3 px-2 text-center font-black text-slate-500">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${team.rank <= 4 ? "bg-blue-600 text-white" :
                                            team.rank >= standings.length - 2 ? "bg-red-100 text-red-600" :
                                                "bg-slate-100 dark:bg-slate-800"
                                            }`}>
                                            {team.rank}
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                                        <img src={team.team.logo} alt={team.team.name} className="w-5 h-5 object-contain" />
                                        <span className={isHighlighted ? "text-blue-600 dark:text-blue-400" : ""}>{team.team.name}</span>
                                    </td>
                                    <td className="py-3 px-2 text-center font-medium text-slate-500">{team.all.played}</td>
                                    <td className="py-3 px-2 text-center font-medium text-slate-500">{team.all.win}</td>
                                    <td className="py-3 px-2 text-center font-medium text-slate-500">{team.all.draw}</td>
                                    <td className="py-3 px-2 text-center font-medium text-slate-500">{team.all.lose}</td>
                                    <td className="py-3 px-2 text-center font-medium text-slate-500">{team.all.goals.for}</td>
                                    <td className="py-3 px-2 text-center font-medium text-slate-500">{team.all.goals.against}</td>
                                    <td className="py-3 px-2 text-center font-medium text-slate-500">{team.goalsDiff}</td>
                                    <td className="py-3 px-2 text-center font-black text-slate-900 dark:text-white">{team.points}</td>
                                    <td className="py-3 px-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {team.form?.split('').map((char: string, i: number) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full ${char === 'W' ? 'bg-green-500' :
                                                        char === 'D' ? 'bg-slate-300' :
                                                            'bg-red-500'
                                                        }`}
                                                    title={char}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" /> Champions League
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-100 border border-red-200" /> Relegation
                </div>
            </div>
        </div>
    );
}
