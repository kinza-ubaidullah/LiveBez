"use client";

import { useState, useEffect } from "react";
import { X, Mail, Lock, User, UserPlus, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { registerUser, verifyEmailCode } from "@/lib/actions/auth-actions";
import { toast } from "react-hot-toast";

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
    const [step, setStep] = useState<"form" | "verify">("form");
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [verificationCode, setVerificationCode] = useState("");

    if (!isOpen) return null;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await registerUser(formData);
            if (res.success) {
                setStep("verify");
                toast.success("Verification code sent to your email!");
            } else {
                toast.error(res.error || "Failed to create account");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await verifyEmailCode(formData.email, verificationCode);
            if (res.success) {
                toast.success("Account verified! You can now log in.");
                onSwitchToLogin();
            } else {
                toast.error(res.error || "Invalid verification code");
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
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter font-outfit">
                            {step === "form" ? "Join LiveBaz" : "Verify Account"}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {step === "form" ? "Create your premium sports account" : "Enter the code sent to your email"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-8 space-y-6">
                    {step === "form" ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Full Name"
                                    suppressHydrationWarning
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white"
                                />
                            </div>

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
                                    type="password"
                                    placeholder="Password"
                                    suppressHydrationWarning
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white"
                                />
                            </div>

                            <button
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white rounded-2xl py-5 flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                Create Account
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="flex justify-center py-4">
                                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                    <ShieldCheck className="w-10 h-10 text-blue-600" />
                                </div>
                            </div>

                            <div className="text-center space-y-2 mb-6">
                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight font-outfit">Email Verification</h3>
                                <p className="text-sm text-slate-400 font-medium">We sent a 6-digit code to <span className="text-blue-600 font-bold">{formData.email}</span></p>
                            </div>

                            <input
                                required
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6-digit code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-6 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white"
                            />

                            <button
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white rounded-2xl py-5 flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Verify & Finish
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep("form")}
                                className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                Back to Registration
                            </button>
                        </form>
                    )}

                    <div className="pt-6 text-center border-t border-slate-50 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Already have an account?</p>
                        <button
                            onClick={onSwitchToLogin}
                            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline inline-flex items-center gap-2 group"
                        >
                            Log In to Your Account <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
