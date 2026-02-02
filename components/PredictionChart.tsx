"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PredictionChartProps {
    homeProb: number;
    awayProb: number;
    drawProb: number;
    homeTeam: string;
    awayTeam: string;
}

export default function PredictionChart({ homeProb, awayProb, drawProb, homeTeam, awayTeam }: PredictionChartProps) {
    const [isMounted, setIsMounted] = (require('react')).useState(false);

    (require('react')).useEffect(() => {
        setIsMounted(true);
    }, []);

    const data = [
        { name: homeTeam, value: homeProb, color: '#2563eb' },
        { name: 'Draw', value: drawProb, color: '#94a3b8' },
        { name: awayTeam, value: awayProb, color: '#ef4444' },
    ];

    if (!isMounted) return <div className="w-full h-[300px] bg-slate-50 dark:bg-slate-900/50 rounded-3xl animate-pulse" />;

    return (
        <div className="w-full h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: 'white',
                            color: '#0f172a'
                        }}
                        itemStyle={{ color: '#0f172a' }}
                    />

                </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Winning %</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Win Prob.</span>

            </div>

            {/* Legend */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-6">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{item.name}</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}%</span>

                    </div>
                ))}
            </div>
        </div>
    );
}
