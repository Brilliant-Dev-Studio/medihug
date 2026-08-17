import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = 'https://www.medihug.org';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,          changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/doctors`,   changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/products`,  changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/blog`,      changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/contact`,   changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`,   changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/signin`,    changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/register`,  changeFrequency: 'monthly', priority: 0.4 },
  ];

  const [products, blogs] = await Promise.all([
    db.product.findMany({ where: { isActive: true }, select: { id: true, updatedAt: true } }),
    db.blog.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map(p => ({
    url: `${BASE_URL}/products/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map(b => ({
    url: `${BASE_URL}/blog/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
