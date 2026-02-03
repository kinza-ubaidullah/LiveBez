import Link from "next/link";

export default function NotFound() {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-gradient-to-br from-slate-50 to-slate-100" suppressHydrationWarning>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center px-8">
                        <div className="relative mb-8">
                            <div className="text-[200px] font-black text-slate-100 leading-none select-none">404</div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-8xl">⚽</div>
                            </div>
                        </div>

                        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                            Page Not Found
                        </h1>
                        <p className="text-xl text-slate-500 mb-8 max-w-md mx-auto">
                            Looks like this page went offside. The content you're looking for doesn't exist or has been moved.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/en"
                                className="px-8 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all"
                            >
                                Back to Home
                            </Link>
                            <Link
                                href="/en/blog"
                                className="px-8 py-4 bg-white text-slate-900 font-black uppercase tracking-widest text-sm rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition-all"
                            >
                                Read Articles
                            </Link>
                        </div>

                        <div className="mt-16 flex items-center justify-center gap-8 text-slate-400">
                            <Link href="/en" className="hover:text-blue-600 transition-colors text-sm font-bold">Home</Link>
                            <Link href="/en/blog" className="hover:text-blue-600 transition-colors text-sm font-bold">Blog</Link>
                            <Link href="/admin" className="hover:text-blue-600 transition-colors text-sm font-bold">Admin</Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}

