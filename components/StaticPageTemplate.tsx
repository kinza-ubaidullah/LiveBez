import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function StaticPageTemplate({ slug, lang, hideTitle = false }: { slug: string, lang: string, hideTitle?: boolean }) {
    const page = await prisma.staticPage.findUnique({
        where: { slug },
        include: {
            translations: {
                where: { languageCode: lang }
            }
        }
    });

    if (!page) notFound();

    const translation = page.translations[0];
    if (!translation) notFound();

    const isAboutUs = slug === 'about-us';

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Header / Hero Section */}
            {!hideTitle && (
                <div className="relative overflow-hidden bg-slate-900 border-b border-white/5">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.4),transparent)]" />
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(#2563eb 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
                    </div>

                    <div className="container mx-auto px-6 py-24 lg:py-40 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 animate-pulse">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Corporate Identity
                        </div>
                        <h1 className="text-6xl lg:text-9xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">
                            {translation.title.split('|')[0]}
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 drop-shadow-[0_0_30px_rgba(37,99,235,0.3)] mt-2">
                                {translation.title.split('|')[1] || translation.title}
                            </span>
                        </h1>

                        <div className="mt-12 flex items-center justify-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="text-white">Active</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            </div>
                            <div className="w-px h-4 bg-slate-800" />
                            <div>EST. 2024</div>
                            <div className="w-px h-4 bg-slate-800" />
                            <div>v{page.updatedAt.getFullYear()} Release</div>
                        </div>
                    </div>
                </div>
            )}


            {/* Main Content Body */}
            <div className="container mx-auto px-6 py-20 lg:py-32 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">

                    {/* Floating Sidebar (Navigation/Quick Stats) */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="sticky top-10 space-y-8">
                            <div className="premium-card p-10 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-2xl rounded-[3rem] overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 blur-2xl" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-6">Our Mission</h4>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight italic">
                                    "Redefining sports analytics through the lens of pure, unbiased data intelligence."
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
                                    <div className="text-4xl font-black italic mb-1">95%</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Accuracy</div>
                                </div>
                                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                                    <div className="text-4xl font-black italic mb-1">24/7</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Coverage</div>
                                </div>
                            </div>

                            {isAboutUs && (
                                <div className="relative h-72 rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900">
                                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20" />

                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">System Intelligence</div>
                                        <div className="text-white font-bold text-base leading-snug">Real-time market tracking across 500+ global leagues.</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rich Content Area */}
                    <div className="lg:col-span-8">
                        <article
                            className="rich-text-content prose prose-slate lg:prose-xl dark:prose-invert max-w-none 
                            prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-headings:italic
                            prose-h3:text-3xl prose-h3:text-blue-600 prose-h3:mb-8 prose-h3:mt-16
                            prose-h4:text-xl prose-h4:text-slate-900 dark:prose-h4:text-white prose-h4:mb-4
                            prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:mb-8
                            prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-li:font-bold prose-li:mb-2
                            prose-ul:list-none prose-ul:pl-0"
                            dangerouslySetInnerHTML={{ __html: translation.content }}
                        />

                        <div className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-12">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Platform Engine</div>
                                <div className="font-black italic text-xl text-slate-900 dark:text-white">Powered by Nitro Play</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Legal Age</div>
                                <div className="font-black italic text-xl text-slate-900 dark:text-white">18+ Restricted</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Data Source</div>
                                <div className="font-black italic text-xl text-slate-900 dark:text-white">Live Odds API-S</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles Override for Rich Text */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .rich-text-content ul li {
                    position: relative;
                    padding-left: 2rem;
                }
                .rich-text-content ul li::before {
                    content: '●';
                    position: absolute;
                    left: 0;
                    color: #2563eb;
                    font-size: 0.8rem;
                }
                .rich-text-content h4 {
                    display: inline-block;
                    padding: 0.2rem 1rem;
                    background: rgba(37, 99, 235, 0.05);
                    border-radius: 0.5rem;
                    border-left: 4px solid #2563eb;
                }
            ` }} />
        </div>
    );
}
