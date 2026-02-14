import StaticPageTemplate from "@/components/StaticPageTemplate";
import prisma from "@/lib/db";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const { lang } = await params;
    const page = await prisma.staticPage.findUnique({
        where: { slug: 'terms-of-service' },
        include: {
            translations: {
                where: { languageCode: lang },
                include: { seo: true }
            }
        }
    });

    const trans = page?.translations[0];
    if (!trans) return { title: 'Terms of Service' };

    return {
        title: trans.seo?.title || trans.title,
        description: trans.seo?.description || trans.content.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    };
}

export default async function TermsOfServicePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return <StaticPageTemplate slug="terms-of-service" lang={lang} />;
}

