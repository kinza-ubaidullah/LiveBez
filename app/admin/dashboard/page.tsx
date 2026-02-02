import prisma from "@/lib/db";
import SyncDataButton from "@/components/admin/SyncDataButton";

export default async function AdminDashboard() {
    const [leaguesCount, matchesCount, articlesCount, bookmakersCount] = await Promise.all([
        prisma.league.count(),
        prisma.match.count(),
        prisma.article.count(),
        prisma.bookmaker.count(),
    ]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Leagues</div>
                    <div className="text-4xl font-bold">{leaguesCount}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Matches</div>
                    <div className="text-4xl font-bold">{matchesCount}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Articles</div>
                    <div className="text-4xl font-bold">{articlesCount}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Bookmakers</div>
                    <div className="text-4xl font-bold">{bookmakersCount}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SyncDataButton />

                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold mb-4">Welcome back, Admin</h3>
                    <p className="text-slate-600 mb-4">
                        Use the sidebar to manage leagues, matches, and prediction articles.
                        Sync live data from The Odds API to populate matches automatically.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-600 font-bold">Live Data API Connected</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
