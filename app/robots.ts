import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.net';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/', '/private/'],
      crawlDelay: 1,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}