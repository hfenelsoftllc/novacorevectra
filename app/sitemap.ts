import { MetadataRoute } from 'next';
import { generateSitemapData } from '../src/utils/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapData = generateSitemapData();
  
  return sitemapData.map(entry => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}