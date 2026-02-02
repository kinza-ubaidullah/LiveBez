import { Metadata } from "next";

interface SeoInput {
    title?: string | null;
    description?: string | null;
    canonical?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: string | null;
    noIndex?: boolean;
}

export async function generatePageMetadata(seo: SeoInput | null | undefined): Promise<Metadata> {
    if (!seo) return {};

    return {
        title: seo.title || undefined,
        description: seo.description || undefined,
        alternates: {
            canonical: seo.canonical || undefined,
        },
        openGraph: {
            title: seo.ogTitle || seo.title || undefined,
            description: seo.ogDescription || seo.description || undefined,
            images: seo.ogImage ? [{ url: seo.ogImage }] : [],
        },
        robots: {
            index: !seo.noIndex,
            follow: !seo.noIndex,
        },
    };
}
