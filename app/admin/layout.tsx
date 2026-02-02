import "../globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
                <ThemeProvider>
                    <div className="flex min-h-screen">
                        {/* Sidebar */}
                        <aside className="w-64 bg-slate-900 text-white flex flex-col">
                            <div className="p-6 text-xl font-bold border-b border-slate-800">
                                Admin Panel
                            </div>
                            <nav className="flex-1 p-4 space-y-2">
                                <Link href="/admin/dashboard" className="block p-3 rounded hover:bg-slate-800 transition">Dashboard</Link>
                                <Link href="/admin/leagues" className="block p-3 rounded hover:bg-slate-800 transition">Leagues</Link>
                                <Link href="/admin/matches" className="block p-3 rounded hover:bg-slate-800 transition">Matches</Link>
                                <Link href="/admin/articles" className="block p-3 rounded hover:bg-slate-800 transition">Articles</Link>
                                <Link href="/admin/bookmakers" className="block p-3 rounded hover:bg-slate-800 transition">Bookmakers</Link>
                            </nav>
                            <div className="p-4 border-t border-slate-800">
                                <Link href="/" className="text-sm text-slate-400 hover:text-white transition">← Back to Site</Link>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 p-8 overflow-y-auto">
                            <header className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold">Management</h2>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-slate-500">admin@platform.com</span>
                                    <div className="w-8 h-8 bg-blue-600 rounded-full" />
                                </div>
                            </header>
                            {children}
                        </main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
