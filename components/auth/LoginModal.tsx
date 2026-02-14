"use client";

import { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, Loader2, Info } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error === "PLEASE_VERIFY") {
                    toast.error("Please verify your email address first");
                    // Optionally switch to verification mode or redirect
                } else {
                    toast.error("Invalid email or password");
                }
            } else {
                toast.success("Logged in successfully!");
                onClose();
                window.location.reload(); // Refresh to update session
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 transition-all duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-[440px] rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden animate-fade-up font-jakarta"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter font-outfit">Welcome Back</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Access your account details</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-10 space-y-8">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                required
                                type="email"
                                placeholder="E-mail"
                                suppressHydrationWarning
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                suppressHydrationWarning
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-14 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <button type="button" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Forgot your password?</button>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-slate-950 dark:bg-blue-600 text-white rounded-2xl py-5 flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                            Sign In
                        </button>
                    </form>

                    <div className="pt-6 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">New to LiveBaz?</p>
                        <button
                            onClick={onSwitchToRegister}
                            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline inline-flex items-center gap-2 group"
                        >
                            Create an Account <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import Link from "next/link";
