import prisma from "@/lib/db";
import Link from "next/link";

export default async function AdminStaticPages() {
    const pages = await prisma.staticPage.findMany({
        include: {
            translations: {
                where: { languageCode: 'en' }
            }
        }
    });

    return (
        <div className="max-w-6xl pb-24">
            <header className="mb-12">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Content Infrastructure</div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
                    Static <span className="text-blue-600 underline underline-offset-8 decoration-4">Pages</span>
                </h1>
                <p className="text-slate-500 text-sm mt-4">Manage About Us, Privacy Policy, and Terms of Service. These pages are crucial for SEO and legal compliance.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {pages.map(page => (
                    <Link
                        key={page.id}
                        href={`/admin/pages/${page.id}`}
                        className="premium-card p-8 bg-white border-slate-100 flex items-center justify-between group hover:border-blue-500 transition-all"
                    >
                        <div>
                            <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Slug: /{page.slug}</div>
                            <div className="text-xl font-black text-slate-900 uppercase italic">
                                {page.translations[0]?.title || page.slug}
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                    </Link>
                ))}

                {pages.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest">
                        No static pages found. Run seed script.
                    </div>
                )}
            </div>
        </div>
    );
}
