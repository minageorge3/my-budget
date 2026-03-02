"use client";
import { useState } from "react";
import { createClient } from "../utils/supabase/client";
import { toast } from "sonner";

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const supabase = createClient();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            toast.error("Error signing up: " + error.message);
        } else {
            window.location.href = "/dashboard";
            toast.success("Signed up successfully!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <form onSubmit={handleSignUp} className="bg-gray-800 p-8 rounded-2xl shadow-xl w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Create Account 🚀</h1>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 mb-4 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 mb-6 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition cursor-pointer">
                    Sign Up
                </button>
                <p className="mt-4 text-center text-gray-400">
                    Already have an account?{" "}
                    <button onClick={() => window.location.href = '/login'} className="cursor-pointer text-blue-500 hover:underline">
                        Login
                    </button>
                </p>
            </form>
        </div>
    );
}