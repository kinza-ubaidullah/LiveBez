import prisma from "@/lib/db";
import LeagueForm from "@/components/admin/LeagueForm";

export default async function NewLeaguePage() {
    const languages = await prisma.language.findMany({
        orderBy: { name: 'asc' }
    });

    // Dummy initial league object for the form
    const emptyLeague = {
        id: "",
        country: "",
        logoUrl: "",
        translations: []
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-12">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Competition Management</div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Register New League</h1>
                <p className="text-slate-500 text-sm mt-4 max-w-2xl">Establish a new league in the system. Ensure all language versions and SEO parameters are initialized for optimal search performance from day one.</p>
            </div>

            <LeagueForm league={emptyLeague} languages={languages} isNew={true} />
        </div>
    );
}
