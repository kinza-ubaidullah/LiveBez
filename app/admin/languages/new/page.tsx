import LanguageForm from "@/components/admin/LanguageForm";

export default function NewLanguagePage() {
    return (
        <div className="space-y-8">
            <div className="text-center mb-12">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">System Configuration</div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Add New Language</h1>
            </div>

            <LanguageForm />
        </div>
    );
}
