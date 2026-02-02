"use client";

import { useState } from "react";

export default function NotifyButton({ label }: { label: string }) {
    const [subscribed, setSubscribed] = useState(false);

    const handleClick = () => {
        setSubscribed(!subscribed);
        // In a real app, this would call an API to subscribe the user to push notifications
        if (!subscribed) {
            alert("Alerts Enabled! You will be notified when goals happen.");
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all duration-300 ${subscribed
                    ? "bg-green-500 text-white shadow-green-500/20"
                    : "bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700"
                }`}
        >
            {subscribed ? "Alerts On ✅" : label}
        </button>
    );
}
