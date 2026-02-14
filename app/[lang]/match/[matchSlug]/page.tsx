import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string, matchSlug: string }> }) {
    const { lang, matchSlug } = await params;

    const matchTrans = await prisma.matchTranslation.findUnique({
        where: { slug: matchSlug },
        include: { seo: true }
    });

    if (!matchTrans || matchTrans.languageCode !== lang) {
        return { title: "Match Not Found | LiveBaz" };
    }

    return generatePageMetadata(matchTrans.seo);
}

export default async function MatchSlugPage({ params }: { params: Promise<{ lang: string, matchSlug: string }> }) {
    const { lang, matchSlug } = await params;

    const matchTrans = await prisma.matchTranslation.findUnique({
        where: { slug: matchSlug },
        include: {
            match: {
                include: {
                    league: {
                        include: {
                            translations: { where: { languageCode: lang } }
                        }
                    }
                }
            }
        }
    });

    if (!matchTrans || matchTrans.languageCode !== lang) {
        notFound();
    }

    const leagueSlug = matchTrans.match.league.translations[0]?.slug || 'any';

    // Redirect to the canonical league-nested URL
    redirect(`/${lang}/league/${leagueSlug}/${matchSlug}`);
}
