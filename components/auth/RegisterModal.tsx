"use client";

import { useState } from "react";
import { X, Mail, Lock, User, UserPlus } from "lucide-react";

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 transition-all duration-300"
            onClick={(e) => {
                console.log("RegisterModal background clicked");
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-[440px] rounded-[2rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden animate-fade-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Registration</h2>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-10 space-y-8">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="email"
                                placeholder="E-mail"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white rounded-2xl py-5 flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all shadow-xl">
                        <UserPlus className="w-4 h-4" /> Create Account
                    </button>

                    <div className="pt-6 text-center border-t border-slate-50 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Already have an account?</p>
                        <button
                            onClick={onSwitchToLogin}
                            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
