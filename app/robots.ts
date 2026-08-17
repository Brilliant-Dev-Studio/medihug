import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/patient/', '/doctor/', '/partner/'],
      },
    ],
    sitemap: 'https://www.medihug.org/sitemap.xml',
    host: 'https://www.medihug.org',
  };
}
