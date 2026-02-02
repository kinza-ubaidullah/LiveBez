import Link from "next/link";

export default async function ProPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;

    return (
        <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
            <div className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-widest text-blue-600 uppercase bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800">
                Premium Membership
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-[1.05] tracking-tight text-slate-900 dark:text-white">
                Join <span className="text-blue-600">LiveBaz</span> Pro
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12">
                Get access to exclusive 10-star tips, detailed algorithmic analysis, and ad-free browsing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {/* Free Plan */}
                <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <h3 className="text-xl font-black mb-2">Starter</h3>
                    <div className="text-4xl font-black mb-6">$0</div>
                    <ul className="space-y-4 text-left text-sm text-slate-500 mb-8">
                        <li>✓ Daily Tips</li>
                        <li>✓ Basic Stats</li>
                        <li>✗ Expert Verdicts</li>
                    </ul>
                    <button className="w-full py-4 rounded-xl font-black uppercase text-xs border border-slate-200 dark:border-slate-600">Current Plan</button>
                </div>

                {/* Pro Plan */}
                <div className="p-8 rounded-3xl bg-blue-600 text-white transform scale-105 shadow-2xl">
                    <h3 className="text-xl font-black mb-2">Pro Grinder</h3>
                    <div className="text-4xl font-black mb-6">$19<span className="text-lg opacity-60">/mo</span></div>
                    <ul className="space-y-4 text-left text-blue-100 mb-8">
                        <li>✓ All Tips & Analysis</li>
                        <li>✓ Advanced Metrics</li>
                        <li>✓ No Ads</li>
                    </ul>
                    <button className="w-full py-4 rounded-xl font-black uppercase text-xs bg-white text-blue-600">Join Now</button>
                </div>

                {/* VIP Plan */}
                <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <h3 className="text-xl font-black mb-2">Whale VIP</h3>
                    <div className="text-4xl font-black mb-6">$99<span className="text-lg opacity-60">/mo</span></div>
                    <ul className="space-y-4 text-left text-slate-500 mb-8">
                        <li>✓ Direct Support</li>
                        <li>✓ API Access</li>
                        <li>✓ White Label</li>
                    </ul>
                    <button className="w-full py-4 rounded-xl font-black uppercase text-xs bg-slate-900 text-white">Contact Sales</button>
                </div>
            </div>
        </div>
    );
}
