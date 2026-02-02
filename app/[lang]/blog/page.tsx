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
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-12 text-slate-900 dark:text-white leading-tight">{t.blog.title}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article: any) => {
                    const translation = article.translations[0];
                    if (!translation) return null;
                    return (
                        <article key={article.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:-translate-y-1">
                            <div className="h-56 bg-slate-100 dark:bg-slate-700 relative overflow-hidden group">
                                {article.featuredImage ? (
                                    <Image
                                        src={article.featuredImage}
                                        alt={translation.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-500 font-black italic text-4xl uppercase tracking-tighter">
                                        Insight
                                    </div>
                                )}
                            </div>


                            <div className="p-6">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">{article.category}</span>
                                <h2 className="text-xl font-bold mt-2 mb-3 leading-tight text-slate-900 dark:text-white">

                                    <Link href={`/${lang}/blog/${translation.slug}`} className="hover:text-primary transition">
                                        {translation.title}
                                    </Link>
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4">{translation.excerpt || translation.content.substring(0, 150)}...</p>

                                <Link href={`/${lang}/blog/${translation.slug}`} className="text-primary font-semibold text-sm inline-flex items-center">
                                    {t.blog.readMore}
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}

