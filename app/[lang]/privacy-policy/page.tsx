import StaticPageTemplate from "@/components/StaticPageTemplate";

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return <StaticPageTemplate slug="privacy-policy" lang={lang} />;
}
