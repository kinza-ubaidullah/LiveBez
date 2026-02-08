import prisma from "@/lib/db";
import BookmakerForm from "@/components/admin/BookmakerForm";

export default async function NewBookmakerPage() {
    const languages = await prisma.language.findMany({
        where: { isVisible: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Add New Bookmaker</h1>
            <BookmakerForm languages={languages} bookmaker={null} />
        </div>
    );
}
