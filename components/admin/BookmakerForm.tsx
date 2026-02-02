"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBookmaker, updateBookmaker } from "@/lib/actions/bookmaker-actions";

interface BookmakerFormProps {
    bookmaker?: any;
    languages: { code: string; name: string }[];
}

export default function BookmakerForm({ bookmaker, languages }: BookmakerFormProps) {
    const router = useRouter();
    const [logoUrl, setLogoUrl] = useState(bookmaker?.logoUrl || "");
    const [rating, setRating] = useState(bookmaker?.rating?.toString() || "5.0");
    const [translations, setTranslations] = useState<Record<string, { name: string; bonusText: string; affiliateUrl: string }>>(
        {}
    );

    useEffect(() => {
        const initialTranslations: Record<string, { name: string; bonusText: string; affiliateUrl: string }> = {};
        languages.forEach((lang) => {
            const existing = bookmaker?.translations?.find((t: any) => t.languageCode === lang.code);
            initialTranslations[lang.code] = {
                name: existing?.name || "",
                bonusText: existing?.bonusText || "",
                affiliateUrl: existing?.affiliateUrl || "",
            };
        });
        setTranslations(initialTranslations);
    }, [languages, bookmaker]);

    const handleTranslationChange = (langCode: string, field: string, value: string) => {
        setTranslations((prev) => ({
            ...prev,
            [langCode]: {
                ...prev[langCode],
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const translationsArray = Object.entries(translations).map(([languageCode, data]) => ({
            languageCode,
            ...data,
        }));

        if (bookmaker) {
            await updateBookmaker(bookmaker.id, { logoUrl, rating, translations: translationsArray });
        } else {
            await createBookmaker({ logoUrl, rating, translations: translationsArray });
        }
        router.push("/admin/bookmakers");
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-slate-800">Global Settings</h2>

                <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Logo URL</label>
                    <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Rating (1-5)</label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="w-32 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {languages.map((lang) => (
                <div key={lang.code} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="uppercase text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-black">{lang.code}</span>
                        {lang.name} Translation
                    </h2>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Name</label>
                        <input
                            type="text"
                            value={translations[lang.code]?.name || ""}
                            onChange={(e) => handleTranslationChange(lang.code, "name", e.target.value)}
                            placeholder={`Bookmaker name in ${lang.name}`}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Bonus Text</label>
                        <input
                            type="text"
                            value={translations[lang.code]?.bonusText || ""}
                            onChange={(e) => handleTranslationChange(lang.code, "bonusText", e.target.value)}
                            placeholder="e.g. 100% up to $500"
                            className="w-full border border-slate-300 rounded-lg px-4 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Affiliate URL</label>
                        <input
                            type="url"
                            value={translations[lang.code]?.affiliateUrl || ""}
                            onChange={(e) => handleTranslationChange(lang.code, "affiliateUrl", e.target.value)}
                            placeholder="https://affiliate.example.com/?ref=livebaz"
                            className="w-full border border-slate-300 rounded-lg px-4 py-2"
                            required
                        />
                    </div>
                </div>
            ))}

            <div className="flex gap-4">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                    {bookmaker ? "Update Bookmaker" : "Create Bookmaker"}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-300 transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
