import "../globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"] });

export const metadata = {
    title: "LiveBez CMSuite | Core Management Interface",
    description: "The advanced administrative engine powering the LiveBez sports prediction ecosystem.",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className="scroll-smooth">
            <body className={`${inter.className} bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-100 selection:text-blue-900`} suppressHydrationWarning>
                <ThemeProvider>
                    <div className="flex min-h-screen relative overflow-hidden">
                        {/* Interactive Sidebar Shell */}
                        <AdminSidebar />

                        {/* Main Content Node */}
                        <div className="flex-1 flex flex-col min-w-0 relative">
                            {/* Glassmorphic Header */}
                            <AdminHeader />

                            <main className="flex-1 p-6 lg:p-12 2xl:p-16 overflow-x-hidden">
                                <div className="max-w-[1600px] mx-auto">
                                    {children}
                                </div>
                            </main>

                            {/* Footer / System Info */}
                            <footer className="px-12 py-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <div>LIVEBEZ CMSuite &copy; 2026</div>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        System Active
                                    </span>
                                    <span>V1.4.0-STABLE</span>
                                </div>
                            </footer>
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
