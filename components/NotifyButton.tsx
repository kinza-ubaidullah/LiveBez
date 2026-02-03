"use client";

import { useState, useEffect } from "react";
import { saveSubscription } from "@/lib/actions/notification-actions";

export default function NotifyButton({ label }: { label: string }) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'denied' | 'unsupported'>('idle');

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setStatus('unsupported');
            return;
        }

        if (Notification.permission === 'granted') {
            setStatus('active');
        } else if (Notification.permission === 'denied') {
            setStatus('denied');
        }
    }, []);

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribe = async () => {
        setStatus('loading');
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setStatus('denied');
                return;
            }

            const registration = await navigator.serviceWorker.register('/sw.js');

            // Wait for the service worker to be active
            await navigator.serviceWorker.ready;

            // Small delay to ensure SW is fully initialized
            await new Promise(resolve => setTimeout(resolve, 500));

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            });

            const subJson = subscription.toJSON();
            const res = await saveSubscription(subJson);

            if (res.success) {
                setStatus('active');
                // Display confirmation notification
                new Notification("Alerts Real Functional!", {
                    body: "You will now receive live goal alerts for this session.",
                    icon: "/logo.png"
                });
            } else {
                throw new Error("Failed to save subscription");
            }
        } catch (err) {
            console.error("Subscription failed:", err);
            setStatus('idle');
            alert("Could not enable alerts. Please check browser settings.");
        }
    };

    if (status === 'unsupported') return null;

    return (
        <button
            onClick={subscribe}
            disabled={status === 'active' || status === 'loading'}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all duration-500 flex items-center justify-center gap-3 ${status === 'active'
                ? "bg-emerald-500 text-white shadow-emerald-500/20 cursor-default"
                : status === 'denied'
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 active:scale-[0.98]"
                }`}
        >
            <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-white animate-ping' : 'bg-white/40'}`} />
            {status === 'loading' ? 'Processing...' : status === 'active' ? 'Alerts Functional ✅' : status === 'denied' ? 'Alerts Blocked' : label}
        </button>
    );
}
