"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateArticleAction(
    articleId: string,
    data: {
        categoryId: string;
        leagueId?: string;
        matchId?: string;
        published: boolean;
        isFeatured: boolean;
        featuredImage?: string;
        translations: {
            languageCode: string;
            title: string;
            slug: string;
            content: string;
            excerpt?: string;
            seo: {
                title?: string;
                description?: string;
                h1?: string;
                canonical?: string;
                ogTitle?: string;
                ogDescription?: string;
                ogImage?: string;
                noIndex: boolean;
            };
        }[];
    }
) {
    try {
        // 1. Update Article model
        await prisma.article.update({
            where: { id: articleId },
            data: {
                categoryId: data.categoryId,
                leagueId: data.leagueId || null,
                matchId: data.matchId || null,
                published: data.published,
                isFeatured: data.isFeatured,
                featuredImage: data.featuredImage
            } as any
        });


        // 2. Loop through translations
        for (const trans of data.translations) {
            // Check slug uniqueness (excluding current article)
            const existingTrans = await prisma.articleTranslation.findFirst({
                where: {
                    slug: trans.slug,
                    NOT: { articleId: articleId }
                }
            });

            if (existingTrans) {
                return { error: `Slug "${trans.slug}" is already taken.` };
            }

            const currentTrans = await prisma.articleTranslation.findFirst({
                where: { articleId, languageCode: trans.languageCode }
            });

            if (currentTrans) {
                await prisma.articleTranslation.update({
                    where: { id: currentTrans.id },
                    data: {
                        title: trans.title,
                        slug: trans.slug,
                        content: trans.content,
                        excerpt: trans.excerpt,
                        seo: {
                            update: {
                                title: trans.seo.title,
                                description: trans.seo.description,
                                h1: trans.seo.h1,
                                canonical: trans.seo.canonical,
                                ogTitle: trans.seo.ogTitle,
                                ogDescription: trans.seo.ogDescription,
                                ogImage: trans.seo.ogImage,
                                noIndex: trans.seo.noIndex
                            }
                        }
                    }
                });
            } else {
                // Create SEO first to avoid nested write type errors
                const newSeo = await prisma.seoFields.create({
                    data: {
                        title: trans.seo.title,
                        description: trans.seo.description,
                        h1: trans.seo.h1,
                        canonical: trans.seo.canonical,
                        noIndex: trans.seo.noIndex,
                        ogTitle: trans.seo.ogTitle,
                        ogDescription: trans.seo.ogDescription,
                        ogImage: trans.seo.ogImage,
                    }
                });

                await prisma.articleTranslation.create({
                    data: {
                        articleId,
                        languageCode: trans.languageCode,
                        title: trans.title,
                        slug: trans.slug,
                        content: trans.content,
                        excerpt: trans.excerpt,
                        seoId: newSeo.id
                    }
                });
            }
        }

        revalidatePath(`/admin/articles/${articleId}`);
        revalidatePath(`/[lang]/blog`, 'layout');
        return { success: true, id: articleId };
    } catch (error: any) {
        console.error("Failed to update article:", error);
        return { error: error.message || "Failed to update article" };
    }
}

export async function checkArticleSlugUniqueness(slug: string, articleId?: string) {
    const existing = await prisma.articleTranslation.findUnique({
        where: { slug }
    });

    if (existing && existing.articleId !== articleId) {
        return { isUnique: false };
    }
    return { isUnique: true };
}

export async function createArticleAction(
    data: {
        categoryId: string;
        leagueId?: string;
        matchId?: string;
        published: boolean;
        isFeatured: boolean;
        featuredImage?: string;
        translations: {
            languageCode: string;
            title: string;
            slug: string;
            content: string;
            excerpt?: string;
            seo: {
                title?: string;
                description?: string;
                h1?: string;
                canonical?: string;
                ogTitle?: string;
                ogDescription?: string;
                ogImage?: string;
                noIndex: boolean;
            };
        }[];
    }
) {
    try {
        // 1. Create Article model
        const article = await prisma.article.create({
            data: {
                categoryId: data.categoryId,
                leagueId: data.leagueId || null,
                matchId: data.matchId || null,
                published: data.published,
                isFeatured: data.isFeatured,
                featuredImage: data.featuredImage
            } as any
        });

        // 2. Loop through translations
        for (const trans of data.translations) {
            // Check slug uniqueness
            const existingTrans = await prisma.articleTranslation.findFirst({
                where: { slug: trans.slug }
            });

            if (existingTrans) {
                return { error: `Slug "${trans.slug}" is already taken.` };
            }

            // Create SEO
            const newSeo = await prisma.seoFields.create({
                data: {
                    title: trans.seo.title,
                    description: trans.seo.description,
                    h1: trans.seo.h1,
                    canonical: trans.seo.canonical,
                    noIndex: trans.seo.noIndex,
                    ogTitle: trans.seo.ogTitle,
                    ogDescription: trans.seo.ogDescription,
                    ogImage: trans.seo.ogImage,
                }
            });

            await prisma.articleTranslation.create({
                data: {
                    articleId: article.id,
                    languageCode: trans.languageCode,
                    title: trans.title,
                    slug: trans.slug,
                    content: trans.content,
                    excerpt: trans.excerpt,
                    seoId: newSeo.id
                }
            });
        }

        revalidatePath('/admin/articles');
        revalidatePath(`/[lang]/blog`, 'layout');
        return { success: true, id: article.id };
    } catch (error: any) {
        console.error("Failed to create article:", error);
        return { error: error.message || "Failed to create article" };
    }
}
