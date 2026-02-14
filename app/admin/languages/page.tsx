import prisma from "@/lib/db";
import LanguageManager from "@/components/admin/LanguageManager";
import Link from "next/link";

export default async function LanguagesPage() {
    const languages = await prisma.language.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Multilingual Control</div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Language Ecosystem</h1>
                    <p className="text-slate-500 text-sm mt-4 max-w-2xl">Manage platform translations and public visibility. "Hidden" languages will be excluded from the public navbar and routing, allowing you to build content in private.</p>
                </div>

                <Link href="/admin/languages/new" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl inline-block">
                    Add New Language
                </Link>
            </div>

            <LanguageManager initialLanguages={languages} />
        </div>
    );
}
