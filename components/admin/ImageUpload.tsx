"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        if (!file) return;

        setUploading(true);
        setError(null);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    onChange(data.url);
                } else {
                    setError("Upload successful but no URL returned");
                }
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "Upload failed. Check server logs.");
            }
        } catch (error) {
            console.error("Upload failed:", error);
            setError("Network error or server unavailable");
        } finally {
            setUploading(false);
        }
    };


    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleUpload(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    return (
        <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
                {label}
            </label>

            <div
                className={`relative border-2 border-dashed rounded-xl transition-all overflow-hidden ${dragOver
                    ? "border-blue-500 bg-blue-50"
                    : value
                        ? "border-slate-200"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                {value ? (
                    <div className="relative aspect-video">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold"
                            >
                                Replace
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="p-8 text-center cursor-pointer"
                        onClick={() => inputRef.current?.click()}
                    >
                        {uploading ? (
                            <div className="flex flex-col items-center gap-3">
                                <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span className="text-sm font-bold text-slate-500">Uploading...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Drop image here or click to upload</p>
                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2 px-2">
                    ⚠️ {error}
                </p>
            )}

            <input

                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />
        </div>
    );
}
