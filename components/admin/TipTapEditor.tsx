"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

interface TipTapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const items = [
        { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
        { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
        { label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
        { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
        { label: 'Bullet', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
        {
            label: 'Link', action: () => {
                const url = window.prompt('URL');
                if (url) editor.chain().focus().setLink({ href: url }).run();
            }, active: editor.isActive('link')
        },
    ];

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-xl">
            {items.map((item, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={item.action}
                    className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-md transition-all ${item.active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-500 hover:bg-slate-200'
                        }`}
                >
                    {item.label}
                </button>
            ))}
            <div className="ml-auto flex items-center px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-2" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Saving</span>
            </div>
        </div>
    );
};

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline'
                }
            }),
        ],
        content: content,
        immediatelyRender: false, // Required for SSR/Next.js compatibility
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none p-4 min-h-[300px] outline-none font-medium',
            },
        },
    });

    // Sync content when prop changes (e.g. language switch)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);



    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
