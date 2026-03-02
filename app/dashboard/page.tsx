"use client";
import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// تعريف شكل البيانات
interface Transaction {
    id: number;
    text: string;
    amount: number;
    created_at: string;
    category: string;
}

export default function BudgetPage() {
    const supabase = createClient();
    const router = useRouter();
    
    const [user, setUser] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [text, setText] = useState('');
    const [amount, setAmount] = useState<number | ''>('');

    // --- تصليح التاريخ عشان يفتح على شهر 3 (مارس) بالظبط ---
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayStr = now.toLocaleDateString('en-CA'); // بتجيب YYYY-MM-DD حسب وقتك الحالي

    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
    const [date, setDate] = useState(todayStr);

    // توليد لستة الشهور للسنة الحالية عشان تظهر بالأسماء في الـ Dropdown
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), i, 1);
        return {
            value: `${d.getFullYear()}-${String(i + 1).padStart(2, '0')}`,
            label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        };
    });

    const formatMonthName = (monthStr: string) => {
        return new Date(monthStr + "-01").toLocaleString('en-US', { month: 'long', year: 'numeric' });
    };

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            const startDate = `${selectedMonth}-01`;
            const dateObj = new Date(selectedMonth + "-01");
            dateObj.setMonth(dateObj.getMonth() + 1);
            const endDate = dateObj.toISOString().slice(0, 7) + "-01";

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .gte('created_at', startDate)
                .lt('created_at', endDate)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setTransactions(data);
            }
        };

        fetchData();
    }, [selectedMonth]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        toast.success("Logged out successfully!");
    };

    const addTransaction = async (category: 'income' | 'expense') => {
        if (text.trim() === "" || amount === '') return;

        const finalAmount = category === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));

        const { data, error } = await supabase
            .from('transactions')
            .insert([{ text, amount: finalAmount, category, user_id: user.id, created_at: date }])
            .select();

        if (!error && data) {
            if (date.startsWith(selectedMonth)) {
                setTransactions([data[0], ...transactions]);
                toast.success("Added to current view!");
            } else {
                toast.success("Added to " + formatMonthName(date.slice(0, 7)));
            }
            setText("");
            setAmount("");
        } else {
            toast.error("Error saving to database");
        }
    };

    const deleteTransaction = async (id: number) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) {
            toast.error("Error deleting");
        } else {
            setTransactions(transactions.filter((t) => t.id !== id));
            toast.success("Deleted!");
        }
    };

    const amounts = transactions.map((t) => t.amount);
    const total = amounts.reduce((acc, item) => acc + item, 0);
    const income = amounts.filter((item) => item > 0).reduce((acc, item) => acc + item, 0);
    const expense = Math.abs(amounts.filter((item) => item < 0).reduce((acc, item) => acc + item, 0));

    if (!user) return <div className="text-white text-center py-20 font-bold text-xl">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 pb-10 pt-2 text-white font-sans">
            <div className="max-w-md mx-auto px-4">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-2xl border border-gray-700">
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Logged in as:</p>
                        <p className="text-sm font-bold text-blue-400">{user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="text-xs bg-red-900/30 text-red-400 px-3 py-1 rounded-lg border border-red-900 hover:bg-red-800/40 transition-colors">Logout</button>
                </div>

                {/* --- اختيار الشهر بالاسم (Dropdown) --- */}
                <div className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Select View Month:</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold cursor-pointer appearance-none"
                    >
                        {monthOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-6 rounded-2xl shadow-xl mb-6 text-center border border-white/5">
                    <p className="text-blue-100 text-xs uppercase tracking-widest mb-1 opacity-80">
                        Total Balance ({formatMonthName(selectedMonth)})
                    </p>
                    <h2 className="text-4xl font-extrabold tracking-tight">${total.toLocaleString()}</h2>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-800 p-4 rounded-xl border-b-4 border-green-600 shadow-md">
                        <p className="text-gray-400 text-[10px] uppercase font-bold">Income</p>
                        <p className="text-green-500 text-xl font-bold">+${income.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl border-b-4 border-red-600 shadow-md">
                        <p className="text-gray-400 text-[10px] uppercase font-bold">Expense</p>
                        <p className="text-red-500 text-xl font-bold">-${expense.toLocaleString()}</p>
                    </div>
                </div>

                {/* Add Transaction Form */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border border-gray-700">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Add New Entry
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Description (e.g., Groceries)"
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500"
                        />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Amount"
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <div className="relative">
                            <label className="text-[10px] text-gray-500 uppercase absolute -top-2 left-3 bg-gray-800 px-1 font-bold">Transaction Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                        </div>
                        <div className="flex gap-4 pt-2">
                            <button onClick={() => addTransaction('income')} className="flex-1 bg-green-700 hover:bg-green-600 py-3 rounded-lg font-black transition-all active:scale-95 shadow-lg shadow-green-900/20">+ INCOME</button>
                            <button onClick={() => addTransaction('expense')} className="flex-1 bg-red-700 hover:bg-red-600 py-3 rounded-lg font-black transition-all active:scale-95 shadow-lg shadow-red-900/20">- EXPENSE</button>
                        </div>
                    </div>
                </div>

                {/* History List */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex justify-between items-center">
                        History: {new Date(selectedMonth + "-01").toLocaleString('en-US', { month: 'long' })}
                        <span className="text-[10px] bg-gray-800 px-2 py-1 rounded-md border border-gray-700">{transactions.length} items</span>
                    </h3>
                    {transactions.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-2xl">
                             <p className="text-gray-600 text-sm">No transactions found for this month.</p>
                        </div>
                    )}
                    {transactions.map((t) => (
                        <div key={t.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-900/50 transition-all group shadow-sm">
                            <div className="flex items-center gap-4">
                                <button onClick={() => deleteTransaction(t.id)} className="text-gray-600 hover:text-red-500 transition-colors p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                </button>
                                <div>
                                    <p className="font-bold text-sm text-gray-200 group-hover:text-white">{t.text}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">
                                        {new Date(t.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-black text-sm ${t.amount > 0 ? "text-green-500" : "text-red-400"}`}>
                                {t.amount > 0 ? "+" : "-"}${Math.abs(t.amount).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}