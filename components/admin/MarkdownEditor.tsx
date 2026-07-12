'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import {
  Bold, Italic, Heading1, Heading2, Quote, List, ListOrdered,
  Link2, Code,
} from 'lucide-react';

const SERIF = 'Georgia, "Times New Roman", serif';

function getMarkdown(editor: Editor): string {
  return (editor.storage as unknown as { markdown: { getMarkdown(): string } }).markdown.getMarkdown();
}

function ToolbarButton({ icon: Icon, label, active, onClick }: {
  icon: React.ElementType; label: string; active?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button" title={label} onClick={onClick}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-teal-50 text-[#2ab5ad]' : 'text-gray-500 hover:bg-teal-50 hover:text-[#2ab5ad]'}`}
    >
      <Icon size={14} />
    </button>
  );
}

export default function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Tell your story... type "# " for a heading, "**bold**", "> " for a quote, "- " for a list',
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Markdown.configure({ html: false, transformPastedText: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'min-h-[420px] px-7 py-7 outline-none text-[17px] leading-[1.85] text-gray-800',
        style: `font-family: ${SERIF}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(getMarkdown(editor));
    },
  });

  // Keep editor content in sync if `value` changes externally (e.g. reset)
  useEffect(() => {
    if (!editor) return;
    const current = getMarkdown(editor);
    if (value !== current && value === '') editor.commands.clearContent();
  }, [value, editor]);

  if (!editor) return null;

  const words = editor.state.doc.textContent.trim() ? editor.state.doc.textContent.trim().split(/\s+/).length : 0;
  const readMins = Math.max(1, Math.round(words / 200));

  return (
    <div className="rounded-2xl border border-gray-200/80 overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-16px_rgba(0,0,0,0.10)]">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white px-3 py-2">
        <ToolbarButton icon={Heading1} label="Heading" active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <ToolbarButton icon={Heading2} label="Subheading" active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarButton icon={Bold} label="Bold" active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton icon={Italic} label="Italic" active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()} />
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarButton icon={Quote} label="Quote" active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton icon={List} label="Bullet list" active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton icon={ListOrdered} label="Numbered list" active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarButton icon={Link2} label="Link" active={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('Link URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }} />
        <ToolbarButton icon={Code} label="Code" active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()} />
      </div>

      {/* Editable body — formatting applies live as you type */}
      <EditorContent editor={editor} className="prose prose-teal max-w-none prose-headings:font-bold prose-blockquote:border-l-[#2ab5ad] prose-a:text-[#2ab5ad]" />

      {/* Footer status bar */}
      <div className="flex items-center justify-between px-5 py-2 border-t border-gray-100 bg-gray-50/60">
        <span className="text-[11px] text-gray-400 font-medium">{words} word{words !== 1 ? 's' : ''}</span>
        <span className="text-[11px] text-gray-400 font-medium">{readMins} min read</span>
      </div>
    </div>
  );
}
