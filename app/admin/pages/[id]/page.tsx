import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import StaticPageForm from "@/components/admin/StaticPageForm";

export default async function EditStaticPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const page = await prisma.staticPage.findUnique({
        where: { id },
        include: {
            translations: {
                include: { seo: true }
            }
        }
    });

    if (!page) notFound();

    const languages = await prisma.language.findMany();

    return (
        <div className="max-w-7xl mx-auto pb-24">
            <header className="mb-12">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Editor Core</div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
                    Edit <span className="text-blue-600 underline underline-offset-8 decoration-4">Page Content</span>
                </h1>
            </header>

            <StaticPageForm page={page} languages={languages} />
        </div>
    );
}
