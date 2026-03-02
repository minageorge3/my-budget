"use client";
import { useState } from "react";
import { Facebook, Github, Mail, MessageCircle } from "lucide-react";
export default function Contact() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <footer className="w-full py-6 mt-auto flex flex-col items-center gap-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-800">
            <div className="relative">
                {/* زرار الـ Contact Me */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-5 py-2 bg-gray-800 hover:bg-blue-600/20 border border-gray-700 hover:border-blue-500 rounded-full transition-all duration-300 text-sm font-medium text-blue-400 shadow-lg group"
                >
                    <MessageCircle size={18} className="group-hover:rotate-12 transition-transform" />
                    Connect with me
                </button>

                {/* القائمة المنسدلة */}
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 w-48 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                            <div className="p-2">
                                <a href="https://facebook.com/your-profile" target="_blank" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-600/20 text-gray-300 hover:text-blue-500 transition-colors">
                                    <Facebook size={18} /> <span className="text-sm">Facebook</span>
                                </a>
                                <a href="mailto:dev.minahanna@gmail.com" className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-600/20 text-gray-300 hover:text-red-500 transition-colors">
                                    <Mail size={18} /> <span className="text-sm">Gmail</span>
                                </a>
                                <a href="https://github.com/your-username" target="_blank" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-600/20 text-gray-300 hover:text-white transition-colors">
                                    <Github size={18} /> <span className="text-sm">GitHub</span>
                                </a>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* سطر الـ Copyright */}
            <div className="text-center">
                <p className="text-gray-500 text-xs tracking-widest uppercase">
                    Designed by <span className="font-bold text-gray-300 hover:text-blue-400 transition-colors cursor-default">Mina said george</span>
                    <span className="ml-2">© {new Date().getFullYear()}</span>
                </p>
            </div>
        </footer>
    );
}