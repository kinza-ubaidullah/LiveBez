import StaticPageTemplate from "@/components/StaticPageTemplate";

export default async function AboutUsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return <StaticPageTemplate slug="about-us" lang={lang} />;
}
