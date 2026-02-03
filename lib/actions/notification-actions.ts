"use server";

import prisma from "@/lib/db";
import webpush from "web-push";

// Initialize web-push with VAPID keys
if (process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_EMAIL!,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
    );
}

/**
 * Save or update a push subscription in the database
 */
export async function saveSubscription(subscription: any) {
    try {
        // @ts-ignore - Prisma might need a TS server restart to see the new model
        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            create: {
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            }
        });
        return { success: true };
    } catch (error: any) {
        console.error("Save subscription error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Broadcast a test notification to all active subscribers
 */
export async function sendTestNotification() {
    try {
        // @ts-ignore - Prisma might need a TS server restart to see the new model
        const subscriptions = await prisma.pushSubscription.findMany();

        const notifications = subscriptions.map((sub: any) => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            return webpush.sendNotification(
                pushConfig,
                JSON.stringify({
                    title: "GOAL ALERT! ⚽",
                    body: "Real-time scores are now functional on LiveBaz.",
                    url: "/"
                })
            ).catch(async (err: any) => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // @ts-ignore
                    await prisma.pushSubscription.delete({ where: { id: sub.id } });
                }
            });
        });

        await Promise.all(notifications);
        return { success: true, count: subscriptions.length };
    } catch (error: any) {
        console.error("Broadcast failed:", error);
        return { success: false, error: error.message };
    }
}
