"use client";
import { useState } from "react";
import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Error: " + error.message);
    else alert("Check your email for confirmation!");
    setLoading(false);
  };
  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) 
      toast.error('Enter Mail and Password correctly!');
    else {
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Signed out successfully!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-4">

      <div className="text-center mb-10">
        <h3 className="text-3xl font-extrabold bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
          Budget Tracker App
        </h3>
        <p className="text-gray-400 font-bold tracking-widest text-sm uppercase">
          برنامج حساب الميزانية
        </p>
      </div>
      {/* الكارت الرئيسي */}
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-8 rounded-3xl shadow-2xl shadow-amber-500/20">
        {/* الرأس */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">Please enter your details to sign in</p>
        </div>

        {/* الفورم */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* الزراير */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-transparent border border-gray-600 text-gray-300 font-medium rounded-xl hover:bg-gray-700 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* تزيين في الأسفل */}
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() => window.location.href = '/signup'}
              className="text-blue-500 hover:underline font-semibold cursor-pointer"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}