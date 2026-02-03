import Image from 'next/image';

interface Standing {
    rank: number;
    team: {
        id: number;
        name: string;
        logo: string;
    };
    points: number;
    goalsDiff: number;
    all: {
        played: number;
        win: number;
        draw: number;
        lose: number;
    };
}

interface LeagueStandingsProps {
    standings: Standing[];
    t: any;
}

export default function LeagueStandings({ standings, t }: LeagueStandingsProps) {
    if (!standings || standings.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    {t.ui.leagueStandings || "League Standings"}
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-3 w-12 text-center">{t.ui.tablePos || "#"}</th>
                            <th className="px-4 py-3">{t.ui.tableTeam || "Team"}</th>
                            <th className="px-4 py-3 text-center">{t.ui.tableMP || "PL"}</th>
                            <th className="px-4 py-3 text-center">GD</th>
                            <th className="px-4 py-3 text-center text-primary font-black">{t.ui.tablePts || "PTS"}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {standings.map((team, index) => {
                            if (!team?.team) return null;
                            return (
                                <tr key={team.team.id || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-3 text-center font-medium text-slate-500">
                                        {team.rank}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-6 h-6 flex-shrink-0">
                                                {team.team.logo ? (
                                                    <Image
                                                        src={team.team.logo}
                                                        alt={team.team.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 rounded-full" />
                                                )}
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                                                {team.team.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                                        {team.all.played}
                                    </td>
                                    <td className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                                        {team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}
                                    </td>
                                    <td className="px-4 py-3 text-center font-black text-primary tabular-nums text-base">
                                        {team.points}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
