"use client";

import { useState } from "react";
import { updateMatchAction, checkMatchSlugUniqueness } from "@/lib/actions/match-actions";
import { useRouter } from "next/navigation";
import TipTapEditor from "./TipTapEditor";
import ImageUpload from "./ImageUpload";


interface MatchFormProps {
    match: any;
    languages: any[];
}

export default function MatchForm({ match, languages }: MatchFormProps) {
    const router = useRouter();
    const [activeLang, setActiveLang] = useState(languages[0]?.code || 'en');

    // Match fields
    const [date, setDate] = useState(new Date(match.date).toISOString().slice(0, 16));
    const [homeScore, setHomeScore] = useState(match.homeScore ?? "");
    const [awayScore, setAwayScore] = useState(match.awayScore ?? "");
    const [status, setStatus] = useState(match.status);
    const [lineups, setLineups] = useState(match.lineups || "");
    const [stats, setStats] = useState(match.stats || "");
    const [homeTeamLogo, setHomeTeamLogo] = useState(match.homeTeamLogo || "");
    const [awayTeamLogo, setAwayTeamLogo] = useState(match.awayTeamLogo || "");


    // Prediction fields (from match.prediction)
    const [winProbHome, setWinProbHome] = useState(match.prediction?.winProbHome || 33);
    const [winProbAway, setWinProbAway] = useState(match.prediction?.winProbAway || 33);
    const [winProbDraw, setWinProbDraw] = useState(match.prediction?.winProbDraw || 34);

    // Translations
    const [translations, setTranslations] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        languages.forEach(lang => {
            const existing = match.translations.find((t: any) => t.languageCode === lang.code);
            initial[lang.code] = {
                languageCode: lang.code,
                name: existing?.name || `${match.homeTeam} vs ${match.awayTeam}`,
                slug: existing?.slug || "",
                content: existing?.content || "",
                analysis: existing?.analysis || "",
                seo: {
                    title: existing?.seo?.title || "",
                    description: existing?.seo?.description || "",
                    canonical: existing?.seo?.canonical || "",
                    ogTitle: existing?.seo?.ogTitle || "",
                    ogDescription: existing?.seo?.ogDescription || "",
                    ogImage: existing?.seo?.ogImage || "",
                    noIndex: existing?.seo?.noIndex || false,
                }
            };
        });
        return initial;
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [slugStatus, setSlugStatus] = useState<Record<string, 'idle' | 'checking' | 'unique' | 'taken'>>({});

    const handleTransChange = (field: string, value: any) => {
        setTranslations(prev => ({
            ...prev,
            [activeLang]: { ...prev[activeLang], [field]: value }
        }));
    };

    const validateSlug = async (slug: string) => {
        if (!slug) return;
        setSlugStatus(prev => ({ ...prev, [activeLang]: 'checking' }));
        const { isUnique } = await checkMatchSlugUniqueness(slug, match.id);
        setSlugStatus(prev => ({ ...prev, [activeLang]: isUnique ? 'unique' : 'taken' }));
    };

    const handleSeoChange = (field: string, value: any) => {
        setTranslations(prev => ({
            ...prev,
            [activeLang]: {
                ...prev[activeLang],
                seo: { ...prev[activeLang].seo, [field]: value }
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await updateMatchAction(match.id, {
            date: new Date(date),
            homeScore: homeScore === "" ? undefined : Number(homeScore),
            awayScore: awayScore === "" ? undefined : Number(awayScore),
            status,
            lineups,
            stats,
            homeTeamLogo,
            awayTeamLogo,
            winProbHome: Number(winProbHome),

            winProbAway: Number(winProbAway),
            winProbDraw: Number(winProbDraw),
            translations: Object.values(translations)
        });

        if (result.success) {
            setMessage({ type: 'success', text: "Match updated successfully!" });
            router.refresh();
        } else {
            setMessage({ type: 'error', text: result.error || "Failed to update match." });
        }
        setLoading(false);
    };

    const currentTrans = translations[activeLang];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {message && (
                <div className={`p-4 rounded-lg font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Scoreboard Logic */}
            <div className="premium-card p-10 bg-slate-900 border-none shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl -mr-32 -mt-32 rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex-1 text-center md:text-right">
                        <div className="text-sm font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Home Team</div>
                        <h2 className="text-4xl font-black tracking-tighter mb-6">{match.homeTeam}</h2>
                        <input
                            type="number"
                            value={homeScore}
                            onChange={(e) => setHomeScore(e.target.value)}
                            className="bg-slate-800 border-none rounded-2xl w-24 h-24 text-4xl font-black text-center focus:ring-4 focus:ring-blue-500 transition-all outline-none"
                            placeholder="-"
                        />
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        <div className="px-5 py-2 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Live Console</div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-transparent border border-slate-700 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-blue-500"
                        >
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="LIVE">Live</option>
                            <option value="FINISHED">Finished</option>
                            <option value="POSTPONED">Postponed</option>
                        </select>
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-slate-800 border-none rounded-lg p-2 text-xs font-mono outline-none"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="text-sm font-black uppercase tracking-[0.3em] text-red-400 mb-4">Away Team</div>
                        <h2 className="text-4xl font-black tracking-tighter mb-6">{match.awayTeam}</h2>
                        <input
                            type="number"
                            value={awayScore}
                            onChange={(e) => setAwayScore(e.target.value)}
                            className="bg-slate-800 border-none rounded-2xl w-24 h-24 text-4xl font-black text-center focus:ring-4 focus:ring-blue-500 transition-all outline-none"
                            placeholder="-"
                        />
                    </div>
                </div>
            </div>

            {/* Language Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 pb-px">
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLang(lang.code)}
                        className={`px-8 py-4 font-black text-xs transition-all border-b-2 uppercase tracking-widest ${activeLang === lang.code
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-300 hover:text-slate-500'
                            }`}
                    >
                        {lang.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3 space-y-12">
                    {/* Prediction Engine */}
                    <div className="premium-card p-8 bg-blue-50 border-blue-100">
                        <h3 className="text-lg font-black text-blue-900 uppercase tracking-widest mb-8 flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            Prediction Logic
                        </h3>
                        <div className="space-y-10">
                            {[
                                { label: 'Home Win', val: winProbHome, set: setWinProbHome, color: 'bg-blue-600' },
                                { label: 'Draw', val: winProbDraw, set: setWinProbDraw, color: 'bg-slate-400' },
                                { label: 'Away Win', val: winProbAway, set: setWinProbAway, color: 'bg-red-500' },
                            ].map((prob, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-black uppercase text-slate-500">{prob.label}</label>
                                        <span className={`text-xl font-black tracking-tighter ${prob.color.replace('bg-', 'text-')}`}>{prob.val}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100" value={prob.val}
                                        onChange={(e) => prob.set(Number(e.target.value))}
                                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            ))}
                            <div className="pt-4 border-t border-blue-100 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-blue-400">Total Probability</span>
                                <span className={`text-sm font-black ${Number(winProbHome) + Number(winProbAway) + Number(winProbDraw) === 100 ? 'text-green-600' : 'text-orange-500 animate-pulse'}`}>
                                    {Number(winProbHome) + Number(winProbAway) + Number(winProbDraw)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Match Name (H1 Heading)</label>
                        <input
                            type="text"
                            value={currentTrans.name}
                            onChange={(e) => handleTransChange('name', e.target.value)}
                            className="w-full text-3xl font-black text-slate-900 border-none outline-none placeholder:text-slate-200"
                            placeholder="Enter Match Title..."
                        />
                        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 border-b pb-4">
                            <span>/{activeLang}/league/[league]/</span>
                            <input
                                type="text"
                                value={currentTrans.slug}
                                onChange={(e) => handleTransChange('slug', e.target.value)}
                                onBlur={(e) => validateSlug(e.target.value)}
                                className={`bg-transparent outline-none border-b border-transparent focus:border-blue-300 px-1 ${slugStatus[activeLang] === 'taken' ? 'text-red-500' : 'text-slate-500'
                                    }`}
                                placeholder="match-slug-here"
                            />
                        </div>
                        {slugStatus[activeLang] === 'taken' && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">Slug already taken!</p>}
                    </div>

                    <div className="space-y-6">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expert Analysis (Rich Text Content)</label>
                        <TipTapEditor
                            content={currentTrans.analysis}
                            onChange={(content) => handleTransChange('analysis', content)}
                        />
                    </div>

                    {/* Technical Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Lineups (Text/List)</label>
                            <textarea
                                value={lineups}
                                onChange={(e) => setLineups(e.target.value)}
                                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm outline-none focus:border-blue-500"
                                placeholder="Home: Player 1, Player 2... Away: Player A, Player B..."
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Match Stats</label>
                            <textarea
                                value={stats}
                                onChange={(e) => setStats(e.target.value)}
                                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm outline-none focus:border-blue-500"
                                placeholder="Possession: 50% - 50%, Shots: 10 - 5..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar SEO */}
                <div className="space-y-8">
                    <div className="premium-card p-8 bg-white space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Home Team Logo</h4>
                        <ImageUpload
                            value={homeTeamLogo}
                            onChange={(url) => setHomeTeamLogo(url)}
                        />
                    </div>

                    <div className="premium-card p-8 bg-white space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Away Team Logo</h4>
                        <ImageUpload
                            value={awayTeamLogo}
                            onChange={(url) => setAwayTeamLogo(url)}
                        />
                    </div>

                    <div className="premium-card p-8 bg-white space-y-8">

                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-4">SEO Override</h3>
                        <div className="space-y-6">
                            {/* Preview Button */}
                            <div className="flex justify-end">
                                <a
                                    href={`/${activeLang}/match/${currentTrans.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                                >
                                    Preview Page <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                </a>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Title</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.title}
                                    onChange={(e) => handleSeoChange('title', e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg p-3 text-xs outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Description</label>
                                <textarea
                                    value={currentTrans.seo.description}
                                    onChange={(e) => handleSeoChange('description', e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg p-3 text-xs outline-none focus:border-blue-500 h-24 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Canonical URL</label>
                                <input
                                    type="text"
                                    value={currentTrans.seo.canonical}
                                    onChange={(e) => handleSeoChange('canonical', e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg p-3 text-xs outline-none focus:border-blue-500 placeholder:text-slate-300"
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Advanced OG */}
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">OG Image URL</label>
                                    <input
                                        type="text"
                                        value={currentTrans.seo.ogImage}
                                        onChange={(e) => handleSeoChange('ogImage', e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg p-3 text-xs outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">NoIndex (Hide from Google)</span>
                                    <div
                                        onClick={() => handleSeoChange('noIndex', !currentTrans.seo.noIndex)}
                                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${currentTrans.seo.noIndex ? 'bg-red-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 bg-white w-3 h-3 rounded-full transition-all ${currentTrans.seo.noIndex ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-black uppercase tracking-widest text-xs text-white transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Match'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
