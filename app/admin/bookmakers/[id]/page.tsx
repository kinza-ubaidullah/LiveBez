import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import BookmakerForm from "@/components/admin/BookmakerForm";
import Link from "next/link";

export default async function EditBookmakerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [bookmaker, languages] = await Promise.all([
        id === 'new' ? Promise.resolve(null) : prisma.bookmaker.findUnique({
            where: { id },
            include: { translations: true }
        }),
        prisma.language.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    if (!bookmaker && id !== 'new') notFound();

    return (
        <div className="max-w-7xl pb-24">
            <div className="flex items-center space-x-4 mb-10">
                <Link href="/admin/bookmakers" className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </Link>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">Corporate Integration</div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
                        {id === 'new' ? 'New' : 'Edit'} <span className="text-emerald-600 underline underline-offset-8 decoration-4">Partner</span>
                    </h1>
                </div>
            </div>

            <BookmakerForm bookmaker={bookmaker} languages={languages} />
        </div>
    );
}
