import prisma from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata() {
    return {
        title: "Sports Blog - Analysis & Insights",
        description: "Read the latest news and analysis from the world of sports.",
    };
}

export default async function BlogListPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const t = getDictionary(lang);

    const articles = await prisma.article.findMany({
        where: {
            published: true,
            translations: {
                some: { languageCode: lang }
            }
        },
        include: {
            translations: {
                where: { languageCode: lang }
            },
            category: {
                include: {
                    translations: { where: { languageCode: lang } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const featuredArticle = articles[0];
    const remainingArticles = articles.slice(1);

    return (
        <div className="bg-[#f8fafc] dark:bg-[#020617] min-h-screen">
            <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl space-y-16">

                {/* Header Section */}
                <div className="space-y-4 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
                        Expert Insights
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                        {t.blog.title || "LATEST FROM THE HUB"}
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                        Deep dives into tactics, transfer rumors, and expert match analysis from our global team.
                    </p>
                </div>

                {/* Featured Article Section */}
                {featuredArticle && (
                    <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 aspect-[21/9] flex items-end">
                        <Image
                            src={featuredArticle.featuredImage || '/images/hero-bg.png'}
                            alt="Featured"
                            fill
                            className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                        <div className="relative z-10 p-8 md:p-16 space-y-6 max-w-3xl">
                            <span className="text-blue-500 font-black text-xs uppercase tracking-[0.3em]">Featured Story</span>
                            <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                                <Link href={`/${lang}/blog/${featuredArticle.translations[0]?.slug}`} className="hover:text-blue-500 transition-colors">
                                    {featuredArticle.translations[0]?.title}
                                </Link>
                            </h2>
                            <p className="text-slate-300 text-sm md:text-lg line-clamp-2 md:line-clamp-none font-medium">
                                {featuredArticle.translations[0]?.excerpt || featuredArticle.translations[0]?.content.substring(0, 200) + '...'}
                            </p>
                            <Link
                                href={`/${lang}/blog/${featuredArticle.translations[0]?.slug}`}
                                className="inline-flex h-14 items-center bg-white text-slate-900 px-10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl"
                            >
                                Read Full Report
                            </Link>
                        </div>
                    </section>
                )}

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {remainingArticles.length > 0 ? (
                        remainingArticles.map((article: any) => {
                            const translation = article.translations[0];
                            const categoryTrans = article.category?.translations[0];
                            if (!translation) return null;

                            return (
                                <article key={article.id} className="group flex flex-col space-y-6">
                                    <Link href={`/${lang}/blog/${translation.slug}`} className="relative h-72 rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                                        {article.featuredImage ? (
                                            <Image
                                                src={article.featuredImage}
                                                alt={translation.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-800 font-black italic text-6xl uppercase tracking-tighter">
                                                Insight
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>

                                    <div className="space-y-4 px-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                                {categoryTrans?.name || article.category?.key || 'Sports'}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                {new Date(article.createdAt).toLocaleDateString(lang, { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-none tracking-tighter group-hover:text-blue-600 transition-colors">
                                            <Link href={`/${lang}/blog/${translation.slug}`}>
                                                {translation.title}
                                            </Link>
                                        </h3>

                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 font-medium leading-relaxed">
                                            {translation.excerpt || translation.content.substring(0, 150)}...
                                        </p>

                                        <Link
                                            href={`/${lang}/blog/${translation.slug}`}
                                            className="inline-flex items-center gap-2 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest border-b-2 border-transparent hover:border-blue-600 pb-1 transition-all"
                                        >
                                            Read More
                                            <span className="text-blue-600">→</span>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })
                    ) : featuredArticle ? null : (
                        <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-900 rounded-[3rem]">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Waiting for journalists to publish...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

