import StaticPageTemplate from "@/components/StaticPageTemplate";

export default async function TermsOfServicePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return <StaticPageTemplate slug="terms-of-service" lang={lang} />;
}
