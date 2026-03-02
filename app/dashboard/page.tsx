"use client";
import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client"; // تأكد من المسار صح
import { useRouter } from "next/navigation"; // عشان ننقل المستخدم بين الصفحات
import { toast } from "sonner";
// شكل البيانات اللي هنخزنها في القائمة
interface Transaction {
    id: number;
    text: string;
    amount: number;
}

export default function BudgetPage() {

    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [text, setText] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    // 1. التأكد من هوية المستخدم أول ما الصفحة تفتح
    useEffect(() => {
        const fetchData = async () => {
            // 1. التأكد من المستخدم
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return; // اخرج من الوظيفة لو مفيش مستخدم
            }

            // لو فيه مستخدم، احفظه في الـ State
            setUser(user);

            // 2. جلب المصاريف بتاعته من الداتابيز
            const { data, error } = await supabase
                .from('transactions') // اسم الجدول اللي عملناه
                .select('*')
                .order('created_at', { ascending: false }); // ترتيب من الأحدث للأقدم

            if (!error && data) {
                setTransactions(data); // حط البيانات في القائمة عشان تظهر
            }

        };

        fetchData();
    }, []);

    // وظيفة تسجيل الخروج من جوه صفحة الميزانية
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        toast.success("Logged out successfully!");
    };

    if (!user) return <div className="text-white text-center py-20">Loading...</div>;
    // المخزن بتاع العمليات (بينتهي أول ما تقفل الصفحة)


    // 1. وظيفة إضافة عملية (دخل أو صرف)
    // 1. وظيفة إضافة عملية وحفظها في الداتابيز
    const addTransaction = async (category: 'income' | 'expense') => {
        if (text.trim() === "" || amount === '') return;

        const finalAmount = category === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));

        // إرسال البيانات لسوبابيس
        const { data, error } = await supabase
            .from('transactions')
            .insert([
                {
                    text: text,
                    amount: finalAmount,
                    category: category,
                    user_id: user.id // ربط العملية بالمستخدم الحالي
                }
            ])
            .select();

        if (error) {
            alert("Error saving: " + error.message);
        } else {
            // تحديث القائمة في الصفحة فوراً بعد الحفظ بنجاح
            setTransactions([data[0], ...transactions]);
            setText("");
            setAmount("");
        }
    };



    // 2. وظيفة حذف عملية

    const deleteTransaction = async (id: string | number) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Error deleting: " + error.message);
        } else {
            setTransactions(transactions.filter((t) => t.id !== id));
        }
    };
    // 3. الحسابات (الخلاط)
    const amounts = transactions.map((t) => t.amount);
    const total = amounts.reduce((acc, item) => acc + item, 0);
    const income = amounts.filter((item) => item > 0).reduce((acc, item) => acc + item, 0);
    const expense = Math.abs(amounts.filter((item) => item < 0).reduce((acc, item) => acc + item, 0));

    return (
        <div className="min-h-screen bg-gray-900 pb-10 pt-2 text-white">
            <div className="max-w-md mx-auto px-4">
                {/* هيدر شيك فيه إيميل المستخدم */}
                <div className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-2xl border border-gray-700">
                    <div>
                        <p className="text-xs text-gray-400">Logged in as:</p>
                        <p className="text-sm font-bold text-blue-400">{user.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-xs bg-red-900/30 text-red-400 px-3 py-1 rounded-lg border border-red-900 hover:bg-red-900 transition"
                    >
                        Logout
                    </button>
                </div>



                {/* كارت الرصيد الإجمالي */}
                <div className="bg-blue-600 p-6 rounded-2xl shadow-xl mb-6">
                    <p className="text-blue-100 text-sm uppercase tracking-wider">Total Balance</p>
                    <h2 className="text-4xl font-bold">${total.toLocaleString()}</h2>
                </div>

                {/* كروت الإحصائيات (دخل / صرف) */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-800 p-4 rounded-xl border-b-4 border-green-500 shadow-md">
                        <p className="text-gray-400 text-xs uppercase">Income</p>
                        <p className="text-green-500 text-xl font-bold">+${income.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl border-b-4 border-red-500 shadow-md">
                        <p className="text-gray-400 text-xs uppercase">Expense</p>
                        <p className="text-red-500 text-xl font-bold">-${expense.toLocaleString()}</p>
                    </div>
                </div>

                {/* فورم إضافة عملية جديدة */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border border-gray-700">
                    <h3 className="text-lg font-bold mb-4">Add New Transaction</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What did you spend on?"
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Amount"
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => addTransaction('income')}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition active:scale-95"
                            >
                                + Income
                            </button>
                            <button
                                onClick={() => addTransaction('expense')}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition active:scale-95"
                            >
                                - Expense
                            </button>
                        </div>
                    </div>
                </div>

                {/* قائمة التاريخ - History */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-400 mb-2">Recent History</h3>
                    {transactions.length === 0 && <p className="text-gray-500 text-center">No transactions yet.</p>}
                    {transactions.map((t) => (
                        <div
                            key={t.id}
                            className="flex justify-between items-center bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-r-4 border-blue-800 hover:border-blue-500 group"
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => deleteTransaction(t.id)}
                                    className="text-gray-500 hover:text-red-500 transition cursor-pointer"
                                    title="Delete"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20" height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="text-red-800 hover:text-red-600 transition-colors duration-200"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    </svg>
                                </button>
                                <span className="font-medium">{t.text}</span>
                            </div>
                            <span className={`font-bold ${t.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                                {t.amount > 0 ? "+" : "-"}${Math.abs(t.amount).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}