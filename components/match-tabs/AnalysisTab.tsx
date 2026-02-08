"use client";

interface AnalysisTabProps {
    content: string | null;
}

export default function AnalysisTab({ content }: AnalysisTabProps) {
    return (
        <div className="premium-card p-10 relative overflow-hidden group border-none bg-white dark:bg-slate-900 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-8 bg-primary rounded-full" />
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Expert Preview</div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">Match Analysis</h2>
                    </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-headings:font-black prose-headings:italic prose-headings:tracking-tighter prose-strong:text-primary prose-a:text-primary hover:prose-a:underline">
                    {content ? (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                        <p className="italic text-slate-400 text-lg">Detailed tactical analysis and expert insights for this match are being compiled by our scouts. Stay tuned for the full breakdown.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
