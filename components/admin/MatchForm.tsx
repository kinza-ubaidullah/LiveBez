"use client";

import { useState } from "react";
import { updateMatchAction, createMatchAction, checkMatchSlugUniqueness, generateAIAnalysisAction, updateAnalysisStatusAction } from "@/lib/actions/match-actions";
import { useRouter } from "next/navigation";
import TipTapEditor from "./TipTapEditor";
import ImageUpload from "./ImageUpload";

interface MatchFormProps {
    match: any;
    languages: any[];
    leagues?: any[];
    isNew?: boolean;
}

export default function MatchForm({ match, languages, leagues = [], isNew = false }: MatchFormProps) {
    const router = useRouter();
    const [activeLang, setActiveLang] = useState(languages[0]?.code || 'en');

    // Match fields
    const [homeTeam, setHomeTeam] = useState(match?.homeTeam || "");
    const [awayTeam, setAwayTeam] = useState(match?.awayTeam || "");
    const [leagueId, setLeagueId] = useState(match?.leagueId || (leagues.length > 0 ? leagues[0].id : ""));
    const [date, setDate] = useState(match?.date ? new Date(match.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
    const [homeScore, setHomeScore] = useState(match?.homeScore ?? "");
    const [awayScore, setAwayScore] = useState(match?.awayScore ?? "");
    const [status, setStatus] = useState(match?.status || "SCHEDULED");
    const [lineups, setLineups] = useState(match?.lineups || "");
    const [stats, setStats] = useState(match?.stats || "");
    const [h2h, setH2h] = useState(match?.h2h || "");
    const [homeTeamLogo, setHomeTeamLogo] = useState(match?.homeTeamLogo || "");
    const [awayTeamLogo, setAwayTeamLogo] = useState(match?.awayTeamLogo || "");
    const [mainTip, setMainTip] = useState(match?.mainTip || "");
    const [confidence, setConfidence] = useState(match?.confidence || 78);
    const [isFeatured, setIsFeatured] = useState(match?.isFeatured || false);
    const [isManual, setIsManual] = useState(match?.prediction?.isManual || false);

    // Prediction fields
    const [winProbHome, setWinProbHome] = useState(match.prediction?.winProbHome || 33);
    const [winProbAway, setWinProbAway] = useState(match.prediction?.winProbAway || 33);
    const [winProbDraw, setWinProbDraw] = useState(match.prediction?.winProbDraw || 34);
    const [bttsProb, setBttsProb] = useState(match.prediction?.bttsProb || 50);
    const [overProb, setOverProb] = useState(match.prediction?.overProb || 50);
    const [underProb, setUnderProb] = useState(match.prediction?.underProb || 50);

    // Translations
    const [translations, setTranslations] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        languages.forEach(lang => {
            const existing = match?.translations?.find((t: any) => t.languageCode === lang.code);
            initial[lang.code] = {
                languageCode: lang.code,
                name: existing?.name || (isNew ? "" : `${homeTeam} vs ${awayTeam}`),
                slug: existing?.slug || "",
                content: existing?.content || "",
                analysis: existing?.analysis || "",
                status: existing?.status || "DRAFT",
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
        const { isUnique } = await checkMatchSlugUniqueness(slug, match?.id);
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
        const payload = {
            homeTeam,
            awayTeam,
            leagueId,
            date: new Date(date),
            homeScore: homeScore === "" ? undefined : Number(homeScore),
            awayScore: awayScore === "" ? undefined : Number(awayScore),
            status,
            lineups,
            stats,
            h2h,
            homeTeamLogo,
            awayTeamLogo,
            mainTip,
            confidence: Number(confidence),
            isFeatured,
            winProbHome: Number(winProbHome),
            winProbAway: Number(winProbAway),
            winProbDraw: Number(winProbDraw),
            bttsProb: Number(bttsProb),
            overProb: Number(overProb),
            underProb: Number(underProb),
            isManual,
            translations: Object.values(translations)
        };

        const result = isNew
            ? await createMatchAction(payload)
            : await updateMatchAction(match.id, payload);

        if (result.success) {
            setMessage({ type: 'success', text: isNew ? "Match created successfully!" : "Match updated successfully!" });
            if (isNew && result.id) {
                router.push(`/admin/matches/${result.id}`);
            } else {
                router.refresh();
            }
        } else {
            setMessage({ type: 'error', text: result.error || "Failed to process match." });
        }
        setLoading(false);
    };

    const currentTrans = translations[activeLang];

    const handleGenerateAI = async () => {
        setLoading(true);
        const result = await generateAIAnalysisAction(match.id, activeLang);
        if (result.success) {
            handleTransChange('analysis', result.analysis);
            setMessage({ type: 'success', text: "AI Analysis generated as Draft!" });
        } else {
            setMessage({ type: 'error', text: result.error || "AI generation failed" });
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {message && (
                <div className={`p-4 rounded-lg font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Scoreboard Info */}
            <div className="premium-card p-10 bg-slate-900 border-none shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl -mr-32 -mt-32 rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex-1 text-center md:text-right space-y-4">
                        <div className="text-sm font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Home Team</div>
                        {isNew ? (
                            <input
                                type="text" value={homeTeam} onChange={e => setHomeTeam(e.target.value)}
                                className="bg-slate-800 border-none rounded-xl p-4 text-xl font-bold w-full text-right outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Team Name..."
                            />
                        ) : (
                            <h2 className="text-4xl font-black tracking-tighter mb-6">{match.homeTeam}</h2>
                        )}
                        <input
                            type="number"
                            value={homeScore}
                            onChange={(e) => setHomeScore(e.target.value)}
                            className="bg-slate-800 border-none rounded-2xl w-24 h-24 text-4xl font-black text-center focus:ring-4 focus:ring-blue-500 transition-all outline-none"
                            placeholder="-"
                        />
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        <div className="px-5 py-2 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Control Unit</div>
                        {isNew && (
                            <select
                                value={leagueId}
                                onChange={(e) => setLeagueId(e.target.value)}
                                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-blue-500 text-white"
                            >
                                <option value="">Select League</option>
                                {leagues.map(l => (
                                    <option key={l.id} value={l.id}>{l.translations[0]?.name || l.country}</option>
                                ))}
                            </select>
                        )}
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
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Featured</span>
                            <button
                                type="button"
                                onClick={() => setIsFeatured(!isFeatured)}
                                className={`w-10 h-5 rounded-full relative transition-colors ${isFeatured ? 'bg-primary' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isFeatured ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="text-sm font-black uppercase tracking-[0.3em] text-red-400 mb-4">Away Team</div>
                        {isNew ? (
                            <input
                                type="text" value={awayTeam} onChange={e => setAwayTeam(e.target.value)}
                                className="bg-slate-800 border-none rounded-xl p-4 text-xl font-bold w-full text-left outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Team Name..."
                            />
                        ) : (
                            <h2 className="text-4xl font-black tracking-tighter mb-6">{match.awayTeam}</h2>
                        )}
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

            {/* Language Selection */}
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

                    {/* Prediction Categories & Tips */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="premium-card p-8 bg-blue-50 border-blue-100 relative">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-blue-100">
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.2em]">Probability Engine</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-blue-600">Manual Override</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsManual(!isManual)}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${isManual ? 'bg-blue-600' : 'bg-blue-200'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isManual ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { label: 'Home Win', val: winProbHome, set: setWinProbHome, color: 'text-blue-600' },
                                    { label: 'Draw', val: winProbDraw, set: setWinProbDraw, color: 'text-slate-400' },
                                    { label: 'Away Win', val: winProbAway, set: setWinProbAway, color: 'text-red-500' },
                                ].map((prob, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500">{prob.label}</label>
                                            <span className={`text-lg font-black tracking-tighter ${prob.color}`}>{prob.val}%</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="100" value={prob.val}
                                            onChange={(e) => prob.set(Number(e.target.value))}
                                            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="premium-card p-8 bg-slate-50 border-slate-200">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 pb-4 border-b border-slate-200">Prediction Details</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Main Betting Tip</label>
                                    <input
                                        type="text"
                                        value={mainTip}
                                        onChange={(e) => setMainTip(e.target.value)}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold uppercase tracking-tight outline-none focus:border-blue-500"
                                        placeholder="e.g. Home Win or BTTS Yes"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Confidence Score (%)</label>
                                    <input
                                        type="number"
                                        value={confidence}
                                        onChange={(e) => setConfidence(Number(e.target.value))}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2 text-center">
                                        <span className="text-[8px] font-black uppercase text-slate-400">BTTS %</span>
                                        <input type="number" value={bttsProb} onChange={(e) => setBttsProb(Number(e.target.value))} className="w-full text-center p-2 bg-white border border-slate-200 rounded-xl text-xs font-black" />
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <span className="text-[8px] font-black uppercase text-slate-400">O2.5 %</span>
                                        <input type="number" value={overProb} onChange={(e) => setOverProb(Number(e.target.value))} className="w-full text-center p-2 bg-white border border-slate-200 rounded-xl text-xs font-black" />
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <span className="text-[8px] font-black uppercase text-slate-400">U2.5 %</span>
                                        <input type="number" value={underProb} onChange={(e) => setUnderProb(Number(e.target.value))} className="w-full text-center p-2 bg-white border border-slate-200 rounded-xl text-xs font-black" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Display Name (H1 Heading)</label>
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
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expert Analysis (Tab: Analysis)</label>
                            <div className="flex items-center gap-4">
                                <select
                                    value={currentTrans.status}
                                    onChange={(e) => handleTransChange('status', e.target.value)}
                                    className="bg-white border rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={loading}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-900/10"
                                >
                                    {loading ? 'WAITING AI...' : 'Generate with AI'}
                                </button>
                            </div>
                        </div>
                        <TipTapEditor
                            content={currentTrans.analysis}
                            onChange={(content) => handleTransChange('analysis', content)}
                        />
                    </div>

                    {/* Technical Fields */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Lineups (JSON Data)</label>
                                <textarea
                                    value={lineups}
                                    onChange={(e) => setLineups(e.target.value)}
                                    className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] outline-none focus:border-blue-500"
                                    placeholder='[{ team: "Home", formation: "4-3-3", ... }]'
                                />
                                <p className="text-[9px] text-slate-400 italic">This data is normally synced from the API automatically.</p>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Match Statistics (JSON)</label>
                                <textarea
                                    value={stats}
                                    onChange={(e) => setStats(e.target.value)}
                                    className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] outline-none focus:border-blue-500"
                                    placeholder='[{ type: "Shots", home: 10, away: 5 }, ...]'
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Head to Head Data (JSON)</label>
                            <textarea
                                value={h2h}
                                onChange={(e) => setH2h(e.target.value)}
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] outline-none focus:border-blue-500"
                                placeholder='[{ fixture: { id: ... }, teams: { ... }, goals: { ... } }, ...]'
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar SEO */}
                <div className="space-y-8">
                    <div className="premium-card p-8 bg-white space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Home Logo</h4>
                        <ImageUpload
                            value={homeTeamLogo}
                            onChange={(url) => setHomeTeamLogo(url)}
                        />
                    </div>

                    <div className="premium-card p-8 bg-white space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Away Logo</h4>
                        <ImageUpload
                            value={awayTeamLogo}
                            onChange={(url) => setAwayTeamLogo(url)}
                        />
                    </div>

                    <div className="premium-card p-8 bg-white space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-4">SEO Architecture</h3>
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                {(() => {
                                    const leagueSlug = match?.league?.translations?.find((lt: any) => lt.languageCode === activeLang)?.slug || "league";
                                    return (
                                        <a
                                            href={`/${activeLang}/league/${leagueSlug}/${currentTrans.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                                        >
                                            View Live <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                        </a>
                                    );
                                })()}
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

                            {/* Options */}
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hide from Index</span>
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
                                    {loading ? 'Processing...' : 'Update Match Archive'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
