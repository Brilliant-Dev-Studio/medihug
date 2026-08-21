'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { marked } from 'marked';
import TurndownService from 'turndown';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = dynamic(() => import('react-quill-new'), { ssr: false });
const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

/** Quill rich-text editor that stores its content as Markdown — mirrors the pattern in
 * components/doctor/NoteReferralCard.tsx (marked to hydrate HTML in, turndown to convert back
 * out). `value`/`onChange` are markdown strings, so callers never see Quill's HTML. */
export default function MarkdownEditor({ value, onChange, placeholder }: {
  value: string; onChange: (markdown: string) => void; placeholder?: string;
}) {
  const [html, setHtml] = useState(() => (value ? String(marked.parse(value, { async: false })) : ''));
  const lastEmitted = useRef(value);

  // Keep the editor's HTML in sync if `value` changes from outside (e.g. loading a different
  // record) without fighting the user's own typing — only resync when it wasn't us who set it.
  useEffect(() => {
    if (value === lastEmitted.current) return;
    setHtml(value ? String(marked.parse(value, { async: false })) : '');
  }, [value]);

  function handleChange(next: string) {
    setHtml(next);
    const plain = next.replace(/<[^>]+>/g, '').trim();
    const markdown = plain ? turndown.turndown(next) : '';
    lastEmitted.current = markdown;
    onChange(markdown);
  }

  return (
    <div className="quill-note border border-gray-200 bg-white rounded-xl overflow-hidden">
      <QuillEditor
        theme="snow"
        value={html}
        onChange={handleChange}
        placeholder={placeholder}
        modules={{ toolbar: [['bold', 'italic', 'underline'], [{ header: [2, 3, false] }], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'blockquote'], ['clean']] }}
      />
    </div>
  );
}
