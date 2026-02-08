import prisma from "@/lib/db";
import { notFound } from "next/navigation";

export default async function StaticPageTemplate({ slug, lang }: { slug: string, lang: string }) {
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

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <header className="mb-12 border-b border-slate-100 dark:border-slate-800 pb-8">
                <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                    {translation.title}
                </h1>
                <div className="mt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Last Updated</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
                </div>
            </header>

            <div
                className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-headings:italic prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg"
                dangerouslySetInnerHTML={{ __html: translation.content }}
            />
        </div>
    );
}
