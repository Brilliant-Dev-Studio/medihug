'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Calendar, Loader2, Newspaper } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLang } from '../../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface Blog {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  content: string;
  excerpt: string | null;
  imageUrl: string | null;
  category: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [blog, setBlog]       = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blogs/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setBlog(d.blog); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-3">
        <Newspaper className="w-12 h-12 text-gray-200" />
        <p className="text-sm">{mm ? 'ဆောင်းပါး မတွေ့ပါ' : 'Article not found'}</p>
        <Link href="/blog" className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">
          {mm ? 'နောက်သို့' : 'Back to articles'}
        </Link>
      </div>
    );
  }

  const title = mm ? blog.title : (blog.titleEn ?? blog.title);
  const date  = new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString(mm ? 'en-GB' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14">
        <Link href="/blog" className="flex w-fit items-center gap-1.5 text-sm font-semibold mb-6" style={{ color: PRIMARY }}>
          <ChevronLeft className="w-4 h-4" />
          {mm ? 'ဆောင်းပါးများသို့' : 'Back to articles'}
        </Link>

        {blog.category && (
          <span className="inline-block w-fit text-xs font-semibold px-2.5 py-1 rounded-full text-white mb-4" style={{ backgroundColor: PRIMARY }}>
            {blog.category}
          </span>
        )}

        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-snug">{title}</h1>
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-3">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>

        {blog.imageUrl && (
          <div className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden bg-gray-50 mt-6">
            <Image src={blog.imageUrl} alt={title} fill className="object-cover" />
          </div>
        )}

        <article className="prose prose-lg max-w-none mt-8 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
