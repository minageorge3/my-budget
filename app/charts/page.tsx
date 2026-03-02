"use client";
import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function StatsPage() {
    const supabase = createClient();
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const getStats = async () => {
            const { data: transactions } = await supabase.from('transactions').select('*');
            if (transactions) {
                const totalIncome = transactions
                    .filter(t => t.category === 'income')
                    .reduce((sum, t) => sum + Number(t.amount), 0);

                const totalExpense = transactions
                    .filter(t => t.category === 'expense')
                    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

                setChartData([
                    { name: 'Income (دخل)', value: totalIncome },
                    { name: 'Expenses (مصاريف)', value: totalExpense }
                ]);
            }
        };
        getStats();
    }, []);

    const COLORS = ['#22c55e', '#ef4444'];

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <button onClick={() => window.location.href = '/dashboard'} className="mb-5 text-sm text-blue-400 hover:underline cursor-pointer">
                ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-center mb-10">Financial Overview 📊</h1>

            <div className="bg-gray-800 p-6 rounded-3xl shadow-2xl h-[500px] flex flex-col items-center">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%" cy="50%"
                            innerRadius={70} outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#374151', borderRadius: '10px', border: 'none' }} />
                    </PieChart>
                </ResponsiveContainer>

                {/* ده الـ Legend العمولة اللي مستحيل يغلط */}
                <div className="flex justify-center gap-8 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                        <span className="text-sm">Income (دخل)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                        <span className="text-sm">Expenses (مصاريف)</span>
                    </div>
                </div>

                <div className="mt-4 flex gap-12 border-t border-gray-700 pt-6 w-full justify-center">
                    <div className="text-center">
                        <p className="text-green-400 text-xs font-semibold uppercase">Total Income</p>
                        <p className="font-bold text-2xl text-green-500">${chartData[0]?.value || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-red-400 text-xs font-semibold uppercase">Total Expenses</p>
                        <p className="font-bold text-2xl text-red-500">${chartData[1]?.value || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}