import prisma from "@/lib/db";
import BookmakerForm from "@/components/admin/BookmakerForm";
import { notFound } from "next/navigation";

export default async function EditBookmakerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [bookmaker, languages] = await Promise.all([
        prisma.bookmaker.findUnique({
            where: { id },
            include: { translations: true }
        }),
        prisma.language.findMany({
            where: { isVisible: true },
            orderBy: { name: 'asc' }
        })
    ]);

    if (!bookmaker) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Edit Bookmaker</h1>
            <BookmakerForm bookmaker={bookmaker} languages={languages} />
        </div>
    );
}
